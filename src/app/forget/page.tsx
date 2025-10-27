//forget/page.tsx

'use client'

import { useState } from 'react';
import{Eye, EyeOff} from 'lucide-react'
import{useRouter} from 'next/navigation';
import { supabase } from '../../../server-actions/supabase';

export default function Reset() {
    const [email,setEmail] = useState('');
    const[showPassword,setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword)
    }
    const[password, setPassword] = useState('');

    //送信ボタンがクリックされるとdoResetEmail関数が実行
    const sendResetEmail = async() =>{

        const{data,error} = await supabase.auth.resetPasswordForEmail(email,{

            redirectTo:'/forget',
        })

        if(error) throw new Error(error.message)
            console.log(data)

        alert("メールを送信しました")
    }

    return (
        <div className="flex justify-center items-center min-h-screen bg-sky-100 p-4">
            <div className="w-full max-w-lg p-8 space-y-8  ">
             <h1 className="text-6xl font-extrabold text-center text-gray-800">
                    パスワード再設定
            </h1>

            {/* ログインボタンを押すとdoLoginが発生 */}
            <form onSubmit={sendResetEmail} className="space-y-6">
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
                        className='w-full sm:w-56 px-4 py-2 text-white text-lg font-semibold bg-blue-600 
                                       rounded-lg shadow-md hover:bg-blue-700 transition duration-150 
                                       ease-in-out block mx-auto'
                    >
                        パスワード再設定
                    </button>
                </div>
            </form>
            </div>
        </div>

    )
}