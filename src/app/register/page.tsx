//register/page.tsx

'use client'

import { useState } from 'react';
import { registerUser } from '../../../server-actions/auth_actions'; // ファイルパスは適宜修正
import { supabase } from '../../../server-actions/supabase';
import{Eye, EyeOff} from 'lucide-react' ;
import{useRouter} from 'next/navigation';


export default function Register() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const togglePasswordVisibility = () => {
            setShowPassword(!showPassword);
    };
    const router = useRouter();

    const doRegister = async (e: React.FormEvent) => {
        e.preventDefault(); 
        console.log('クライアント：登録開始',{email,password:'***'});
        try {
            //サーバーアクション経由で登録とプロファイル作成を一括実行
            const result = await registerUser(email,password);

            console.log('クライアント：登録成功',result);
            alert(result.message);

            router.push('/login');            
            
        } catch (error) {
            console.error('クライアント：登録エラー',error);
            alert(`登録中にエラーが発生しました: ${error instanceof Error ? error.message : "不明なエラー"}`);
        }
    }

    return (
        //  全体を画面中央に配置するコンテナ (親要素に h-screen が必要なければ、w-full max-w-lg mx-auto p-4 のみでOK)
        <div className="flex justify-center items-center min-h-screen bg-sky-100 p-4">
            
            {/* フォームのコンテナ: 横幅を制限し、中央に配置 (w-4/5に近い max-w-md を採用) */}
            <div className="w-full max-w-lg p-8 space-y-8  ">
                <h1 className="text-6xl font-extrabold text-center text-gray-800">
                    新規登録
                </h1>
                
                {/* Form コンポーネントを標準の form タグに置き換え */}
                <form onSubmit={doRegister} className="space-y-6">
                    
                    {/* FormGroup を div に、Label/Input を標準タグに置き換え */}
                    <div className="space-y-2">
                        {/* Label (p-5 text-[25px] を調整) */}
                        <label htmlFor="email" className="block text-xl font-medium text-gray-700">
                            メールアドレス：
                        </label>
                        {/* Input (w-150, style を調整) */}
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
                    
                    {/* FormGroup を div に、Label/Input を標準タグに置き換え */}
                    <div className="space-y-2">
                        {/* Label (p-5 text-[25px] mt-10 を調整) */}
                        <label htmlFor="password" className="block text-xl font-medium text-gray-700">
                            パスワード：
                        </label>
                        <div className="relative">
                            {/* Input (w-150, style を調整) */}
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                required
                                className="block w-full pr-12 px-4 py-2 border border-gray-300 rounded-lg shadow-sm 
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
                                    <EyeOff className="h-5 w-5" />//非表示
                                ):(
                                    <Eye className="h-5 w-5" /> //表示
                                )}
                            </button>
                        </div>
                    </div>
                    
                    {/* Button を標準の button タグに置き換え、中央揃え (mx-auto block) */}
                    <div className="pt-4">
                        <button
                            type="submit"//ボタンがクリックされると<form>のonSubmitが発生
                            className="w-full sm:w-56 px-4 py-2 text-white text-lg font-semibold bg-blue-600 
                                       rounded-lg shadow-md hover:bg-blue-700 transition duration-150 
                                       ease-in-out block mx-auto" // mx-auto block で水平中央揃え
                        >
                            登録
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}