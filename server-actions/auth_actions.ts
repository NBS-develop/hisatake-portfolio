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
    const {data, error: authError} = await supabaseAdmin.auth.admin.createUser({
        email,
        password,
        email_confirm:true,
        // user_metadata:{
        //     email_verified:true
        // }
    });
    //条件：authErrorがある(Supabaseがエラーを返した。)
    //!data.userがtrue(data.userが無い)ユーザー情報が返ってこなかった
    if (authError || !data.user) {
        console.error("✖Supabase Auth登録失敗：",authError);
        throw new Error(authError?.message || "登録失敗");
    }
    const userId = data.user.id;
    // const emailConfirmed = data.user.email_confirmed_at;

    const debugInfo = {
        userId: userId,
        email: data.user.email,
        emailConfirmedAt: data.user.email_confirmed_at,
        confirmedAt: data.user.confirmed_at,
        createdAt: data.user.created_at,
        // data.user全体を確認
        userKeys: Object.keys(data.user)
    };

    //2.カスタムテーブルへのuser_id挿入
    const {error: profileError} = await supabaseAdmin
        .from('CalorieHistory')
        .insert({
            user_id:userId,      
        });
    if (profileError) {
        console.error("✖CalorieHistoryへの初期データ挿入に失敗：",profileError);
    }

    return { success: true,message:`登録メールを送信しました。[デバッグ: emailConfirmed=${JSON.stringify(debugInfo)}]`}
}

export async function deleteAccount(userId:string){
    //カスタムテーブルからのデータ削除
    const {error:dataError} = await supabaseAdmin
        .from('CalorieHistory')
        .delete()
        .eq('user_id',userId);

    if (dataError){
        console.error("CalorieHistoryのデータ削除に失敗:",dataError);
        //エラーをスローせず、認証ユーザーの削除を優先して続行する選択も可能
    }

    //Auth(認証)ユーザーの削除
    const {error:authError} = await supabaseAdmin.auth.admin.deleteUser(userId);

    if(authError){
        console.error("Supabase Authユーザー削除に失敗:",authError);
        throw new Error(authError?.message || "アカウント削除失敗");
    }

    return {success:true,message:"アカウントと関連データが正常に削除されました。"}
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