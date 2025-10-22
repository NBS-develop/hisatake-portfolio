//ユーザー登録とカスタムテーブルへの挿入をまとめて行うサーバーアクション
//auth_actions.ts

'use server'
import "server-only";
import { createClient } from "@supabase/supabase-js";
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

export async function registerUser(email:string,password:string) {
    //1.Authへのユーザー登録(Supabaseの管理APIを使用)　ユーザー本人が登録ボタンを押さなくてもサーバー側でアカウント作る
    const {data, error: authError} = await supabaseAdmin.auth.admin.createUser({email,password,email_confirm:true});
    //条件：authErrorがある(Supabaseがエラーを返した。)
    //!data.userがtrue(data.userが無い)ユーザー情報が返ってこなかった
    if (authError || !data.user) {
        console.error("Supabase Auth登録失敗：",authError);
        throw new Error(authError?.message || "登録失敗");
    }
    const userId = data.user.id;

    //2.カスタムテーブルへのuser_id挿入
    const {error: profileError} = await supabaseAdmin
        .from('CalorieHistory')
        .insert({
            user_id:userId,      
        });
    if (profileError) {
        console.error("CalorieHistoryへの初期データ挿入に失敗：",profileError);
    }

    return { success: true,message:"登録メールを送信しました。"}
}

//Auth：本人確認
//if (authError || !data.user)👇
// if (authError !== null && authError !== undefined || data.user === undefined || data.user === null)

//====================================================================================//
// 状況                   authError           data.user         判定
// 正常登録                null                {...}             通貨(ifの中に入らない)
// メール重複などで失敗     {message:"error"}   undefined         ifの中に入る
// データが欠落して返った   null               indefined       　　ifの中に入る
//=====================================================================================//
//空じゃなくなる＝Supabaseが何か値(オブジェクト)を返したとき
//空になる＝Supabaseが返せなかった(nullやundefined)時