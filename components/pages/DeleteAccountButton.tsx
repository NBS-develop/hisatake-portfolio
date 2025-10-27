//DeleteAccountButton.tsx
'use client'

import {deleteAccount} from '../../server-actions/auth_actions'
import {useRouter} from 'next/navigation';

interface DeleteAccountButtonProps{
    userId:string;
}

export default function DeleteAccountButton({userId}:DeleteAccountButtonProps){
    const router = useRouter();

    const handleDelete = async () =>{
        if(!window.confirm("アカウントを削除するとこれまでのデータは消えます。よろしいですか？")){
            return;
        }
        try{
            const result = await deleteAccount(userId);

            if(result.success){
                alert("アカウントは削除されました");
                router.push('/login');
            }else{
                alert(`アカウント削除に失敗しました:${result.message}`);
            }
        }catch(error){
            console.error("アカウント削除エラー:",error);
            alert("アカウント削除中にエラーが発生しました。");
        }
    };
    return(
        <button
            onClick={handleDelete}
            className="p-2 bg-red-700 text-white rounded hover:bg-red-800"
        >
            アカウント削除
        </button>
    )
}