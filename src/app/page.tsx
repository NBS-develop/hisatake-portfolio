//page.tsx

'use client'
//useRef：DOM要素への参照を保持するために使用
//ChangeEvent：イベントハンドラーの型定義
import {useState,useRef,ChangeEvent,useEffect} from 'react';
import Head from 'next/head';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import NextImage from "next/image"
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import {useRouter} from 'next/navigation';
import DeleteAccountButton from 'components/pages/DeleteAccountButton'

import{Button} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import CalorieDetailModal from "../../../my-next-app/components/pages/MealDetailModal"
import CalorieResultModal from "../../../my-next-app/components/pages/CalorieResultModal"
import CalorieHistoryModal from 'components/pages/CalorieHistoryModal';
import { DeleteIcon, SubscriptIcon } from 'lucide-react';
import {getWeekCalorie,getDailyMealDetails} from "../../server-actions/calorie_ai";

// import{POST} from '../../../my-next-app/server-actions/calorie_ai'
type FormData = {
  model:string
  chat:string
}
interface CalorieResult{
  totalCalories: number;
  protein:number;
  fat:number;
  carbs:number;
}
type MealType = 'breakfast' | 'lunch' | 'dinner' |null;

interface DailyCalorieSummary{
  date:string;//YYYY-MM-DD
  totalCalories:number;
  //詳細データはpage.tsxのリスト表示では使用しないが、型としては存在
  details:any[];
}
interface DailyMealDetail{
  id:number;
  mealname:string;
  calories:string;
  protein:string;
  fat:string;
  carbs:string;
  mealtime:string;
  picture:string;
  created_at:string;//データのソート(昇順・降順など)に使う
}

export default function Home() {
  const[imageFile,setImageFile] = useState<File | null>(null);
  const[material,setMaterial] = useState<string>("");
  const[mealName,setMealName] = useState<string>("");
  const[loading,setLoading] = useState(false);
  const[result,setResult] = useState<CalorieResult | null>(null);
  const[error,setError] = useState<string | null>(null);
  const[mealType,setMealType] = useState<MealType>(null);
  const[detailModalOpen,setDetailModalOpen] = useState(false);
  const[resultModalOpen,setResultModalOpen] = useState(false);
  const[aiResult,setAiResult] = useState<any | null>(null);
  const[imageSrcBase64,setImageSrcBase64] = useState<string | null>(null);
  const[isCompressing,setIsCompressing] = useState(false);
  const[pastCalorieHistory,setPastCalorieHistory] = useState<DailyCalorieSummary[]>([]);
  const[currentUserId,setCurrentUserId] = useState<string | null>(null);
  const[historyModalOpen,setHistoryModalOpen] = useState(false);
  const[selectedHistoryDate,setSelectedHistoryDate] = useState<string | null>(null);
  const[selectedMealDetails,setSelectedMealDetails] = useState<DailyMealDetail[]>([]);

  //ファイルインプット用
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  //ファイル選択ボタンがクリックされたときのハンドラ
  const handleFileButtonClick = () => {
    fileInputRef.current?.click();
  }
  //カメラ起動ボタンがクリックされたときのハンドラ
  const handleCameraButtonClick = () => {
    cameraInputRef.current?.click();
  }
  const supabase = createClientComponentClient();
  const router = useRouter();
  const[isAuthLoading,setIsAuthLoading] = useState(true);

  //過去のデータを取得
  const fetchCalorieHistory = async (userId:string) => {
    try{
      //サーバーアクションを呼び出し
      const history = await getWeekCalorie(userId);
      setPastCalorieHistory(history);
    }catch(err){
      console.error("過去のカロリー履歴の取得エラー：",err);
      setError("過去のカロリー履歴の読み込みに失敗しました。");
    }
  }

  //詳細ボタンがクリックされたときのハンドラ
  const handleDetailButtonClick = async (date: string) => {
    if(!currentUserId){
      alert("ユーザー認証情報が見つかりません");
      return;
    }
    try{
      //サーバーアクションを呼び出し、特定の日付の詳細データを取得
      const details = await getDailyMealDetails(currentUserId,date);

      //データのソート(フロントエンド側で順序を保証)
      const mealOrder: {[key:string]: number} = {
        'breakfast':1,'lunch':2,'dinner':3
      };

      const sortedDetails = details.sort((a,b) => {
        const orderA = mealOrder[a.mealtime] || 99;
        const orderB = mealOrder[b.mealtime] || 99;

        if (orderA !== orderB) {
          return orderA - orderB;
        }
          //mealtimeが同じ場合はcreated_atでソート(新しいデータ優先)
          //created_atがnullの場合は文字列として最後に来るように
          return (a.created_at || "").localeCompare(b.created_at || "");
      });
      setSelectedMealDetails(sortedDetails as DailyMealDetail[]);
      setSelectedHistoryDate(date);
      setHistoryModalOpen(true);
    }catch(err){
      console.error("日の詳細データの取得エラー",err);
      setError("日の詳細データの読み込みに失敗しました。");
    }
  };

  useEffect(() => {
    async function checkUserSession() {
      const {data:{user},error} = await supabase.auth.getUser();

      if(error || !user) {
        //ログインしていない場合、ログインページへリダイレクト
        console.log("ユーザーセッションが見つかりません。ログインページへリダイレクトします。");
        setIsAuthLoading(false);
        router.push('/login');
      }else{
        //ログインしている場合、ローディングを解除
        console.log("ユーザーセッションを確認しました:",user.id);
        setCurrentUserId(user.id)//ユーザーIDをStateに保存
        setIsAuthLoading(false);
        fetchCalorieHistory(user.id);//ログイン時に履歴を取得
      }
    }
    checkUserSession();

    //リアルタイムでセッション変更を監視
    const {data:{subscription}} = supabase.auth.onAuthStateChange((event, session) => {
      if(event === 'SIGNED_OUT' || !session) {
        router.push('/login');
      }else if(event === 'SIGNED_IN'){
        if(session.user.id){
          setCurrentUserId(session.user.id);
          fetchCalorieHistory(session.user.id);
        }
        setIsAuthLoading(false);
      }
    });
    return () => {
      subscription.unsubscribe();
    };
  },[supabase,router]);

  //認証情報が確定するまでメインコンテンツの表示をブロック
  if (isAuthLoading){
    return(
      <div className="flex justify-center items-center min-h-screen">
        <p>認証情報を確認中...</p>
      </div>
    );
  }
  

  //画像圧縮関数
  const compressImage = async (file: File): Promise<File> => {//受け取り：
    //Promise=処理が完了した後に圧縮された新しいFileオブジェクトを返す
    return new Promise((resolve, reject) => {
      const reader = new FileReader();//Fileの中身をFileReaderで読み取る
      
      reader.onload = (e) => {//FileRedaderが読み込みを終わると実行される
        const img = new Image();//メモリ上の一時的な画像オブジェクトを作成
        
        img.onload = () => {//データを解析し準備できたら実行（ここで画像のサイズ確定）
          // Canvasを作成
          const canvas = document.createElement('canvas');//画像縮小、画質調整
          const ctx = canvas.getContext('2d');//2D描画コンテキストを取得
          //ctxを通じてキャンバスに画像貼り付け、サイズ変更の操作が可能になる
          
          if (!ctx) {
            reject(new Error('Canvas context not available'));
            return;
          }

          // リサイズ計算
          const maxWidth = 1024;//画像幅1024以下
          const maxHeight = 1024;//画像の高さ1024以下
          //let:この後のコードで値が書き換えられる
          let width = img.width;//元の画像の幅
          let height = img.height;//元の画像の高さ

          // アスペクト比を維持しながらリサイズ
          if (width > height) {//もし幅が高さより大きければ横長
            if (width > maxWidth) {//さらに幅が上限を超えていれば
              height = (height * maxWidth) / width;//新しい幅に合わせて高さを縮小
              width = maxWidth;//幅を上限値に設定
            }
          } else {//幅が高さ以下の場合
            if (height > maxHeight) {//高さが上限を超えていれば
              width = (width * maxHeight) / height;//新しい高さに合わせて幅を縮小
              height = maxHeight;//高さを上限値に設定
            }
          }
          //新しい幅と高さを使ってcanvasのサイズを設定
          canvas.width = width;
          canvas.height = height;

          // 新しいサイズにした画像を描画
          ctx.drawImage(img, 0, 0, width, height);

          // JPEG形式で圧縮(品質80%)
          canvas.toBlob(//Blob:バイナリデータ（画像、音声、動画など）を
            //扱うためのデータコンテナ。まだファイル名を持たない、純粋なデータの中身
            (blob) => {//Callbank関数。結果のデータがblob引数として渡される
              if (blob) {
                // BlobからFileオブジェクトを作成
                const compressedFile = new File([blob], file.name, {
                  type: 'image/jpeg',
                  lastModified: Date.now(),
                });
                
                console.log('🖼️ 圧縮完了:', {
                  元のサイズ: `${(file.size / 1024).toFixed(2)} KB`,
                  圧縮後: `${(compressedFile.size / 1024).toFixed(2)} KB`,
                  圧縮率: `${((1 - compressedFile.size / file.size) * 100).toFixed(1)}%`
                });
                
                resolve(compressedFile);
              } else {
                reject(new Error('画像の圧縮に失敗しました'));
              }
            },
            'image/jpeg',
            0.8 // 品質80%
          );
        };

        img.onerror = () => {
          reject(new Error('画像の読み込みに失敗しました'));
        };

        img.src = e.target?.result as string;//実際のファイル読み込みを開始
      };

      reader.onerror = () => {
        reject(new Error('ファイルの読み込みに失敗しました'));
      };

      reader.readAsDataURL(file); //最初にファイルをデータURLとして読み込み
    });
  };


  //ファイルが選択されたときのハンドラ
  const handleImageChange = async (event: ChangeEvent<HTMLInputElement>) => {
    //イベントからファイルリストを取得し、ファイルが選択されているかチェック
    if(event.target.files && event.target.files.length > 0){
      const file = event.target.files[0];//ファイルを取得
      try{
        setIsCompressing(true);//ローディング開始
      
        //圧縮処理実行
        const compressedFile = await compressImage(file);
        setImageFile(compressedFile);//圧縮後のFileを保存

      //画像プレビュー用のBase64URLを生成
      const reader = new FileReader();//FileReaderを再度作成
      //読み込み完了したらBase64形式のデータURLを<img>タグで表示できるようにsetImageBase64に保存
      reader.onloadend = () => {
        setImageSrcBase64(reader.result as string);
        setIsCompressing(false);//ローディング終了
      };
      reader.readAsDataURL(compressedFile);

     }catch(error){
      console.error('画像の圧縮中にエラーが発生しました：',error);
      alert('画像の処理に失敗しました。別の画像を選択してください。');
      setIsCompressing(false);

      //エラー時は上体をクリア
      setImageFile(null);//エラー発生時に半端なデータが残らないように初期化
      setImageSrcBase64(null);
     }
    }else{//ユーザーがファイル選択をキャンセルした場合クリア
      setImageFile(null);
      setImageSrcBase64(null);
    }
  };

  
  
  const handleDeleteImage = () => {
    //画像を保持している状態をクリア、画面から画像を消す
    setImageFile(null);
    setImageSrcBase64(null);

    //inputのvalueもリセット（同じファイルを再選択できるように）
    if(fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    if(cameraInputRef.current) {
      cameraInputRef.current.value = '';
    }
  };
  const handleSubmit = () => {
    console.log("テスト")
  }

  const formatDateToRelative = (dateString: string) => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const targetDate = new Date(dateString);
    targetDate.setHours(0,0,0,0);

    //1日のミリ秒数
    const oneDay = 1000 * 60 * 60 * 24;
    //日付の差(ミリ秒)
    const diffTime = today.getTime() -  targetDate.getTime();
    //日付の差(日)
    const diffDays = Math.floor(diffTime / oneDay);

    if(diffDays === 0) return '今日';
    if(diffDays === 1) return '昨日';
    return`${diffDays}日前`;
  };

    return( 
        
    <Dialog>
       <DialogHeader className="bg-green-300 h-25 flex flex-row items-center justify-between px-10 py-4">
        <div className='flex-1'> </div>
          <DialogTitle className="text-5xl flex-1 text-center ">
            カロリー計算アプリ
          </DialogTitle>
          {currentUserId && (
               <div className="flex-1 flex justify-end ">
                   {/* DeleteAccountButtonは既に上部でインポート済みと仮定 */}
                   <DeleteAccountButton userId={currentUserId} />
               </div>
           )}
        </DialogHeader>
        <div className="flex gap-10 items-start">
          <div className="flex flex-col ">
            <div className=" border rounded mt-10 ml-10 w-200 h-110 flex items-center justify-center gap-20">
              <div className="relative w-[400px] h-[300px] flex items-center justify-center">
                {isCompressing ? (
                  <div className="flex flex-col items-center gap-2">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                    <span className="text-gray-500">画像を処理中...</span>
                  </div>
                ):imageSrcBase64 ? (
                  <>
                  <NextImage
                      src={imageSrcBase64}
                      alt="Preview"
                      layout="fill"
                      objectFit="contain"
                   />

                   <button
                    onClick={handleDeleteImage}
                    className="absolute top-2 right-2 bg-red-500 hover:bg-red-600 rounded-full p-2 shadow-lg transition-all z-10"
                    title="画像を削除"
                    >
                      <DeleteIcon size={24}/>
                    </button>
                  </>
                ):(
                  //画像が未選択の場合
                  <span className="text-gray-500">右のカメラかファイルを選択してください</span>
                )}
              </div> 
            
              <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-[120px] h-[120px] flex items-center justify-center border-none
                                ring-0focus:ring-0 focus-visible:ring-0 shadow-none hover:bg-sky-400 bg-sky-500"
                      onClick={handleFileButtonClick}
                    >
                      <UploadFileIcon sx={{fontSize:100,color:"white",stroke:"none"}}/>
                    </Button>
                  </DialogTrigger >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"//hidden:その要素を画面に出さない
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>写真を追加</DialogTitle>
                    </DialogHeader>
                  </DialogContent>
              </Dialog>
              <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      className="w-[120px] h-[120px] flex items-center justify-center border-none
                                 ring-0focus:ring-0 focus-visible:ring-0 shadow-none hover:bg-sky-400 bg-sky-500"
                      onClick={handleCameraButtonClick}
                    >
                      <AddAPhotoIcon sx={{fontSize:100,color:"white",stroke:"none"}}/>
                    </Button>
                  </DialogTrigger>
                  <input
                    type="file"
                    ref={cameraInputRef}
                    onChange={handleImageChange}
                    accept='image/*'
                    capture="environment"
                    className="hidden"
                  />
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>写真を追加</DialogTitle>
                    </DialogHeader>
                  </DialogContent>
                </Dialog>
              </div>
            
            <div className="flex">
              <Button className="text-2xl border border-black-500 rounded-md h-12 w-200 mt-3 ml-10 text-center flex-items-center bg-blue-500 hover:bg-blue-400"
                    onClick={() => {
                      setDetailModalOpen(true);
                    }} 
              >
                次へ
              </Button>
            </div>
          </div>
            <div>
              {/* 過去のカロリー履歴表示 */}
              <div className="text-2xl border rounded mt-10 mr-10 w-130 h-125 ml-20">
                {pastCalorieHistory.length === 0 ? (
                  <p className="p-4 text-gray-500">過去一週間のカロリー履歴がありません</p>
                ):(
                  <table className="w-full">
                    <tbody>
                      {pastCalorieHistory.map((day,index) =>(
                        <tr key={day.date} className="border-b last,:border-b-0">
                          <td className="pl-4 py-3">
                            {formatDateToRelative(day.date)}の合計:**{day.totalCalories}**kcal
                          </td>
                          <td className='pr-4 py-3 text-right'>
                            <Button
                              onClick={() => handleDetailButtonClick(day.date)}
                              className="bg-green-500 hover:bg-green-400 text-sm h-8"
                            >
                              詳細
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
              
            </div>
            
            {/* MealdetailModalから結果を受け取る */}
            <CalorieDetailModal
              isOpen={detailModalOpen}
              onOpenChange={setDetailModalOpen}
              // onMealNameChange={setMealName}
              onMaterialChange={setMaterial}
              onMealTypeChange={setMealType}
              onMealNameChange={setMealName}
              currentMealType={mealType}
              imageFile={imageFile}
              imageSrcBase64={imageSrcBase64}
              //受信したデータから表示用に必要な情報をを作り、Stateに格納と同時に結果表示用のモーダルオープン
              onCalculate={(data) => {
                //AIから返ってきたデータを整形
                setAiResult({
                  meal_name: mealName,
                  calorie: `${data.totalCalories} kcal`,
                  comment:`P:${data.protein}g / F:${data.fat}g / C:${data.carbs}g`,
                  totalCalories: data.totalCalories,
                  protein:data.protein,
                  fat: data.fat,
                  carbs:data.carbs
                });
                setResultModalOpen(true);//結果モーダルを開く
              }}
            />
            <CalorieResultModal
              isOpen={resultModalOpen}
              onOpenChange={setResultModalOpen}
              //aiResultがresultDataとしてpropsに渡す。
              resultData={aiResult}
              imageSrcBase64={imageSrcBase64}
            />
            <CalorieHistoryModal
              isOpen={historyModalOpen}
              onOpenChange={setHistoryModalOpen}
              historyData={selectedMealDetails}
              selectedDate={selectedHistoryDate}
            />
          </div>
    </Dialog> 
    );
  }