//今回はpropsではなくfetch(ネットワーク通信)での受け渡し
//今回の画像送信はネットワーク通信が必要な処理(OpenAIのAPI)
//データを遠くまで運ぶ必要がある

//carolie_ai.ts

'use server'
import "server-only"
import {OpenAI} from 'openai';
import{ NextRequest, NextResponse} from 'next/server'

export async function POST(request: NextRequest){
  try{
    const formData = await request.formData();
    //料理名、材料名の抽出
    const mealName = formData.get('mealName') as string | null;
    const Material = formData.get('Material') as string | null;
    //画像抽出
    const imageFile = formData.get('image') as File | null;

    if (!imageFile || !mealName || !Material) {
        return NextResponse.json(
            {error: 'Miss meal data: image,mealName, or ingredients'}, 
            {status: 400}
        );
    }
    const openai = new OpenAI();

    //Fileオブジェクトからバイナリデータ(ArrayBuffer)を取得
    const imageArrayBuffer = await imageFile.arrayBuffer();

    //ArrayBufferをNode.jsのBufferに変換
    const imageBuffer = Buffer.from(imageArrayBuffer);

    //BufferをBase64文字列にエンコード(別の形式に変える)
    const base64Image = imageBuffer.toString('base64');

    //MIMEタイプを取得(OpenAIへのリクエストで必要)
    const mimeType = imageFile.type;

    //OpenAIのimage_url形式に整形
    const imageUrlForOpenAI = `data:${mimeType};base64,${base64Image}`;

    //こういう形式で答えを出すとルールを決めている
    const systemPrompt = `あなたはプロの栄養士です。ユーザーが提供した食事の画像、食事名「${mealName}」、**材料「${Material}」を分析し、**総カロリー**と主要な**栄養素(タンパク質、脂質、炭水化物)**の概算を正確に算出してください。回答は必ず以下のJSONスキーマに従ってください。`;
        
    const response = await openai.chat.completions.create({
        model: 'gpt-4o',
        messages: [
            {role: "system",content: systemPrompt},
            {role: "user" , 
                content:[
                    {
                        //カロリーと栄養素を渡す
                        type: "text",
                        text: "この食事のカロリーと栄養素を教えてください。"
                    },
                    {
                        //画像を渡す
                        type:"image_url",
                        image_url:{
                            url: imageUrlForOpenAI,
                            //low/high/auto。分析の精度に影響。
                            detail: "auto"
                        }
                    }
                ]
            }
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
    return NextResponse.json(calorieResult,{status:200});

  }catch (error) {
    console.error(error);

    return NextResponse.json(
        {
            
            error: 'An internal server error occurred during calorie calculation',
            //具体的なエラー内容を伝える
            details:error instanceof Error ? error.message : 'Unknown error'
        },
        {status:500}//エラーを意味する
    );
  }

}
//status:〇〇➡200:OK、400番台:クライアント側の問題、500番台:サーバー側の問題



