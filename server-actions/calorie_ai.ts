//今回の画像送信はネットワーク通信が必要な処理(OpenAIのAPI)
//データを遠くまで運ぶ必要がある

//carolie_ai.ts

'use server'
import "server-only"
import {OpenAI} from 'openai';
import{ NextRequest, NextResponse} from 'next/server'
//↓openaiSDKが定義している型で、チャットAPIに送るメッセージの内容を構成する最小単位
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';
import { createClient} from '@supabase/supabase-js'
const CALORIEHISTORY_TABLE = `CalorieHistory`

const supabaseUrl = process.env.SUPABASE_URL!
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY!
const supabaseAnonKey = process.env.SUPABASE_KEY!

const supabaseAdmin = createClient(supabaseUrl,serviceRoleKey,{
    auth:{
        //サーバーサイドでのAdminクライアント利用であることを明示
        autoRefreshToken:false,
        persistSession: false,
    }
});

export interface CreateHistory {
    id:number;
    user_id:string;
    mealname:string;
    calories:string;
    protein:string;
    fat:string;
    carbs:string;
    mealtime:string;
    picture:string;
    date:string;
    created_at:string;
}
interface CalorieFormData{
    get: (key: 'meal_name' | 'material' | 'meal_type' | 'image' | 'user_id') => string | File | null;
}
//環境変数を読み込む
const openai_api_key = process.env.OPENAI_API_KEY!//"!"絶対にnullでもundefainedでもない
const supabase = createClient(supabaseUrl, supabaseAnonKey!);

export async function deleteUserByEmail(email: string){
    if(!email) {
        throw new Error('Email address is required for use deletion.');
    }

    //1.メールアドレスでユーザーを検索
    const {data: userData,error:listError} = await supabaseAdmin.auth.admin.listUsers({
        perPage:1000,
        page:1,
    });
    if(listError) {
        console.error('ユーザーリストの取得エラー:',listError);
        throw new Error('Failed to retrieve user list from Supabase.');
    }
    //2.検索結果から該当ユーザーを特定
    const userToDelete = userData.users.find(user => user.email === email);

    if (!userToDelete) {
        console.warn(`メールアドレス ${email}のユーザーは見つかりませんでした。`);
        return{success:true,message:'User not found or already deleted.'};
    }
    //3.ユーザーIDを使ってアカウントを削除(Admin権限が必要)
    const userId = userToDelete.id;
    const {error:deleteError} = await supabaseAdmin.auth.admin.deleteUser(userId);

    if(deleteError){
        console.error(`ユーザーID ${userId}の削除エラー:`,deleteError);
        throw new Error('Failed to delete user account.');
    }
    console.log(`ユーザー${email} (ID: ${userId})が正常に削除されました。`);
    return {success:true,message:'User successfully deleted.'};
}

export async function calculateCalorie(formData:FormData){
  let calorieResult: any = null;//tryの外で初期化
  try{
    //クライアントから送られたFormDataから抽出
    // const formData = await request.formData();
    //料理名、材料名の抽出
    const mealName = formData.get('meal_name') ?? "" as String;
    const material = formData.get('material') ?? "" as String;
    const mealType = formData.get('meal_type') ?? "" as String;
    const userId = formData.get('user_id') ?? "" as String;//ユーザーID取得
    //画像抽出
    const imageFile = formData.get('image') as File | null;


    //mealNameかmaterialのどっちか無かったらエラー
    if ( !mealName || !material) {
        throw new Error('Miss meal data: mealName,or ingredients')
    }
    //APIキーがない場合はエラーをスロー
    if(!openai_api_key) {
        throw new Error('OPENAI_API_KEY is not set in environment variables.');
    }

    const openai = new OpenAI({
        apiKey:openai_api_key,//読み込んだ環境変数を渡す
    });

    let imageUrlForOpenAI:string | null = null;

    if(imageFile){
        //Fileオブジェクトからバイナリデータ(ArrayBuffer)を取得
        const imageArrayBuffer = await imageFile.arrayBuffer();

        //ArrayBufferをNode.jsのBufferに変換
        const imageBuffer = Buffer.from(imageArrayBuffer);

        //BufferをBase64文字列にエンコード(別の形式に変える)
        const base64Image = imageBuffer.toString('base64');

        //MIMEタイプを取得(OpenAIへのリクエストで必要)
        const mimeType = imageFile.type;

        //OpenAIのimage_url形式に整形
        imageUrlForOpenAI = `data:${mimeType};base64,${base64Image}`; //base64：画像、ファイルを文字列に変換

    }

    

    //こういう形式で答えを出すとルールを決めている
    const systemPrompt = `あなたはプロの栄養士です。ユーザーが提供した食事の画像、食事名「${mealName}」、**材料「${material}」を分析し、**総カロリー**と主要な**栄養素(タンパク質、脂質、炭水化物)**の概算を正確に算出してください。回答は必ず以下のJSONスキーマに従ってください。
    {
        "totalCalories":number,
        "protein":number,
        "fat": number,
        "carbs": number,    
    }
    JSONオブジェクトの形式で、説明文やマークダウンはつけずに結果のみを出力してください。`;

    //imageUrlForOpenAI:画像有悲しかでOpenAIに送るメッセージの構造を切り替える
    const userContent: ChatCompletionContentPart[] = [
        {
            type: "text",
            text:`食事名：${mealName}\n材料:${material}\nこの食事のカロリーと栄養を教えてください`
        }
    ];

    if(imageUrlForOpenAI){
        userContent.push(
            {
                type:"image_url",
                image_url:{
                    url:imageUrlForOpenAI as string,
                    detail:"auto" as const
                }
            }
        );
    }
    

    
    //OpenAI APIにリクエスト送信、受け取り
    const response = await openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
            {role: "system",content: systemPrompt}, //AIに前提条件・ルールを伝える
            {role: "user" , content: userContent}  //人間の質問
        ],
        //JSON形式で答えるよう指示
        response_format:{type:"json_object"},
        // temperature:0.1//数値が低ければ安定している
    });


    //AIの回答をresponseに格納
    const jsonText = response.choices[0].message.content;

    //AIが何も返さなかった場合にcatchにエラーを渡す
    if(!jsonText) {
        throw new Error('OpenAI returned an empty response or invalid format.');
    }

    //JSON文字列をJavaScriptオブジェクトに変換
    calorieResult = JSON.parse(jsonText);
    
    //Supabaseに自動で保存
    if(userId && calorieResult.totalCalories){
        console.log(`SupabaseにユーザーID：${userId}のカロリー履歴を保存します。`);
        const {error: dbError} = await supabaseAdmin
            .from(CALORIEHISTORY_TABLE)
            .insert({
                user_id: userId,
                mealname: mealName.toString(),
                calories: calorieResult.totalCalories.toString(),
                protein: calorieResult.protein.toString(),
                fat: calorieResult.fat.toString(),
                carbs: calorieResult.carbs.toString(),
                mealtime: mealType,
                picture: imageUrlForOpenAI || '',
                date: new Date().toISOString().split('T')[0],//YYYY-MM--DD形式
            }); 
        if (dbError){
            console.error("Supabaseへの保存エラー：",dbError);
        }else{
            console.log("Supabaseへの保存に成功しました。")
        }
            //データ保存失敗はAI計算の成功には影響しないため、計算結果を返す
    }else {
        console.log("ユーザーIDがないため、またはカロリー結果がないためデータベースに保存しません。")
    } 
    }catch (error) {
        console.error(error);
        throw new Error(error instanceof Error ? error.message: 'Unknown error');
    }
    return calorieResult;
    
}

// export async function saveCalorie(data:CreateHistory):Promise<CreateHistory | null> {
//     const{data:createData,error} = await supabase
//         .from(CALORIEHISTORY_TABLE)
//         .insert([data])
//         .select()
//         .single();

//         if(error) {
//             console.error("createHistory error:",error);
//             return null;
//         }
//         return createData;
// }





//status:〇〇➡200:OK、400番台:クライアント側の問題、500番台:サーバー側の問題





