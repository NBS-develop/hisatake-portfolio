//今回はpropsではなくfetch(ネットワーク通信)での受け渡し
//今回の画像送信はネットワーク通信が必要な処理(OpenAIのAPI)
//データを遠くまで運ぶ必要がある

//carolie_ai.ts

'use server'
import "server-only"
import {OpenAI} from 'openai';
import{ NextRequest, NextResponse} from 'next/server'
//↓openaiSDKが定義している型で、チャットAPIに送るメッセージの内容を構成する最小単位
import type { ChatCompletionContentPart } from 'openai/resources/chat/completions';
//環境変数を読み込む
const openai_api_key = process.env.OPENAI_API_KEY!//"!"絶対にnullでもundefainedでもない




export async function calculateCalorie(formData:FormData){
  try{
    //クライアントから送られたFormDataから抽出
    // const formData = await request.formData();
    //料理名、材料名の抽出
    const mealName = formData.get('meal_name') ?? "" as String;
    const material = formData.get('material') ?? "" as String;
    const mealType = formData.get('meal_type') ?? "" as String;
    //画像抽出
    const imageFile = formData.get('image') as File | null;

    //mealNameかmaterialのどっちか無かったらエラー
    if ( !mealName || !material) {
        // return NextResponse.json(
        //     {error: 'Miss meal data: mealName, or ingredients'}, 
        //     {status: 400}
        // );
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

    // if(imageFile){
    //     //Fileオブジェクトからバイナリデータ(ArrayBuffer)を取得
    //     const imageArrayBuffer = await imageFile.arrayBuffer();

    //     //ArrayBufferをNode.jsのBufferに変換
    //     const imageBuffer = Buffer.from(imageArrayBuffer);

    //     //BufferをBase64文字列にエンコード(別の形式に変える)
    //     const base64Image = imageBuffer.toString('base64');

    //     //MIMEタイプを取得(OpenAIへのリクエストで必要)
    //     const mimeType = imageFile.type;

    //     //OpenAIのimage_url形式に整形
    //     const imageUrlForOpenAI = `data:${mimeType};base64,${base64Image}`;
    // }

    

    //こういう形式で答えを出すとルールを決めている
    const systemPrompt = `あなたはプロの栄養士です。ユーザーが提供した食事の画像、食事名「${mealName}」、**材料「${material}」を分析し、**総カロリー**と主要な**栄養素(タンパク質、脂質、炭水化物)**の概算を正確に算出してください。回答は必ず以下のJSONスキーマに従ってください。
    {
        "totalCalories":number,
        "protein":number,
        "fat": number,
        "carbo": number,    
    }
    JSONオブジェクトの形式で、説明文やマークダウンはつけずに結果のみを出力してください。`;

    //imageUrlForOpenAI:画像有悲しかでOpenAIに送るメッセージの構造を切り替える
    const userContent: ChatCompletionContentPart[] = [
        {
            type: "text",
            text:`食事名：${mealName}\n材料:${material}\nこの食事のカロリーと栄養を教えてください`
        },
    //     {
    //         type:"image_url",
    //         image_url:{
    //             url:imageUrlForOpenAI as string,
    //             detail:"auto" as const
    //         }
    //     }
    // ] : [
    //     {
    //         type:"text",
    //         text:`食事名:${mealName}\n材料:${material}\nこの食事のカロリーと栄養素を教えてください`

    //     }
    ];
        
    
    //OpenAI APIにリクエスト送信、受け取り
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {role: "system",content: systemPrompt}, //AIに前提条件・ルールを伝える
            {role: "user" , content: userContent}  //人間の質問
        ],
        //JSON形式で答えるよう指示
        response_format:{type:"json_object"},
        temperature:0.1//数値が低ければ安定している
    });

    //AIの回答をresponseに格納
    const jsonText = response.choices[0].message.content;

    //AIが何も返さなかった場合にcatchにエラーを渡す
    if(!jsonText) {
        throw new Error('OpenAI returned an empty response or invalid format.');
    }

    //JSON文字列をJavaScriptオブジェクトに変換
    const calorieResult = JSON.parse(jsonText);

    //AIが計算した結果のオブジェクトをクライアントに渡す(200で成功と判断)
    // return NextResponse.json(calorieResult,{status:200});
     return calorieResult;

  }catch (error) {
    console.error(error);

    throw new Error(error instanceof Error ? error.message: 'Unknown error');
  }


//     return NextResponse.json(
//         {
            
//             error: 'An internal server error occurred during calorie calculation',
//             //具体的なエラー内容を伝える
//             details:error instanceof Error ? error.message : 'Unknown error'
//         },
//         {status:500}//エラーを意味する
//     );
//   }

}
//status:〇〇➡200:OK、400番台:クライアント側の問題、500番台:サーバー側の問題



