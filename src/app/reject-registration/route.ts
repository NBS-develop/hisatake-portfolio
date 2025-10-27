import {NextRequest,NextResponse} from 'next/server';
//サーバーアクションのインポート
import{deleteUserByEmail}from '../../../server-actions/calorie_ai';

export async function GET(request:NextRequest){
    const {searchParams} = new URL(request.url);
    const email = searchParams.get('email');

    if(!email) {
        return new NextResponse(`...エラーHTML...`,{status:400,headers:{'Content-Type':'text/html'}});      
    }
    try {
        await deleteUserByEmail(email);//サーバーアクション

        //成功時のレスポンス
        const successHtmlResponse =
            `<html><body><h1>Registration Rejected</h1><p>The account for ${email} has been successfully deleted.</p></body></html>`;
            return new NextResponse(successHtmlResponse,{status:200,headers:{'Content-Type':'text/html'}});
            
    }catch (error){
        //失敗時のレスポンス
        const errorHTMLResponse = 
            '<html><body><h1>Error</h1><p>Account deletion failed.</p></body></html>';
            return new NextResponse(errorHTMLResponse,{status:500,headers:{'Content-Type':'text/html'}});
    }
}