//login.tsx

'use client'

import { useState } from 'react';

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import{Eye, EyeOff} from 'lucide-react'
import{useRouter} from 'next/navigation';

export default function Register() {
    const[email,setEmail] = useState('');
    const[password, setPassword] = useState('');
    const[showPassword,setShowPassword] = useState(false);
    const supabase = createClientComponentClient();
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }
    const router = useRouter();

    const doLogin = async (e:React.FormEvent) => {//フォーム送信イベントを受け取る
        e.preventDefault();
        try{
            //supabaseで用意されているログインの関数
            const {data,error} = await supabase.auth.signInWithPassword({ email,password})
            if(error) {
                console.error('ログインエラー詳細:',error);
                alert(`ログインエラー:${error.message}`);
                return;
            }
            console.log('ログイン成功:',data);
            //成功時のみ遷移
            router.push('/')
        }catch(error){
            //エラーメッセージ
            console.error('ログインエラー',error);
            alert(`ログインに失敗しました。メールアドレスまたはパスワードを確認してください:${error instanceof Error ? error.message : "不明なエラー"}`);
        }      
    }

    return(
        <div className="flex justify-center items-center min-h-screen bg-sky-100 p-4">
            <div className="w-full max-w-lg p-8 space-y-8  ">
             <h1 className="text-6xl font-extrabold text-center text-gray-800">
                    ログイン
            </h1>

            {/* ログインボタンを押すとdoLoginが発生 */}
            <form onSubmit={doLogin} className="space-y-6">
                <div className="space-y-2">
                    <label htmlFor="email" className="block text-xl font-medium text-gray-700">
                        メールアドレス
                    </label>
                    <input
                        id="email"
                        type="email"
                        required
                        className="block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
                                   focus:ring-blue-500 focus:border-blue-500 text-lg"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="メールアドレスを入力"
                    />
                </div>

                <div className="space-y-2">
                    <label htmlFor='password' className='block text-xl font medium text-gray-700'>
                        パスワード
                    </label>
                    <div className="relative">
                        <input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            required
                            className="block w-full px-4 py-2 border-gray-300 rounded-lg shadow-sm
                                       focus:ring-blue-500 focus:border-blue-500 text-lg"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="パスワードを入力"
                        />
                        <button
                            type="button"
                            onClick={togglePasswordVisibility}
                            className="absolute inset-y-0 right-0 flex items-center pr-3 textgray-500 hover:text-gray-400"
                            aria-label={showPassword ? "パスワードを非表示" : "パスワードを表示"}
                        >
                            {showPassword ? (
                                <EyeOff className="h-5 w-5"/>
                            ):(
                                <Eye className='h-5 w-5'/>
                            )}
                        </button>
                    </div>
                </div>

                <div className="pt-4">
                    <button
                        type="submit"//ボタンを押すとOnSubmitが発生
                        className='w-full sm:w-60 px-4 py-2 text-white text-lg font-semibold bg-sky-500 
                                       rounded-lg shadow-md hover:bg-sky-600 transition duration-150 
                                       ease-in-out block mx-auto'
                    >
                        ログイン
                    </button>
                </div>

            </form>
            <div className="mt-6 text-center">
                <button
                    onClick={() => router.push('/register')}
                    className="bg-emerald-500 text-black-500 font-bold text-lg hover:bg-emerald-600 rounded-md mt-3 h-10 w-60"
                >
                    新規登録はこちらへ
                </button>
            </div>
            <div className="mt-6 text-center">
                <button
                    onClick={() => router.push('/forget')}
                    className="text-gray-500 font-bold text-lg bhover:underline rounded-md mt-3 h-10 w-60"
                >
                    パスワードをお忘れの方
                </button>
            </div>
        </div>
    </div>
    )
}