//page.tsx

'use client'
import {useState} from 'react';
import Head from 'next/head';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';

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
// import{POST} from '../../../my-next-app/server-actions/calorie_ai'
type FormData = {
  model:string
  chat:string
}
interface CalorieResult{
  totalCalories: number;
  protein:number;
  fat:number;
  carbo:number;
}
type MealType = 'breakfast' | 'lunch' | 'dinner' |null;

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
  
  const handleSubmit = () => {
    console.log("テスト")
  }

    return( 
    
        
    <Dialog>
       <DialogHeader className="bg-green-300 h-25">
          <DialogTitle className="text-5xl text-center mt-5">
            カロリー計算アプリ
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-10 items-start">
          <div className="flex-col ">
            <div className=" border rounded mt-10 ml-10 w-200 h-110 flex items-center justify-center gap-20">
              <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-[120px] h-[120px] flex items-center justify-center border-none
                                      ring-0focus:ring-0 focus-visible:ring-0 shadow-none hover:bg-sky-400">
                      <UploadFileIcon sx={{fontSize:100,color:"white",stroke:"none"}}/>
                    </Button>
                  </DialogTrigger >
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>写真を追加</DialogTitle>
                    </DialogHeader>
                  </DialogContent>
              </Dialog>
              <Dialog>
                  <DialogTrigger asChild>
                    <Button className="w-[120px] h-[120px] flex items-center justify-center border-none
                                        ring-0focus:ring-0 focus-visible:ring-0 shadow-none">
                      <AddAPhotoIcon sx={{fontSize:100,color:"white",backgroundColor:"#00BFFF",stroke:"none"}}/>
                    </Button>
                  </DialogTrigger>
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
              
              <table className="text-2xl border rounded mt-10 mr-10 w-130 h-125  ml-20  ">
                <thead>
                  <tr>
                    <td className="pl-10">1日前の合計:1500キロカロリー</td>
                    <td className="pr-10">
                      <Button>
                        詳細
                      </Button>
                    </td>
                  </tr>
                </thead>
              </table>
            </div>

            <CalorieDetailModal
              isOpen={detailModalOpen}
              onOpenChange={setDetailModalOpen}
              // onMealNameChange={setMealName}
              onMaterialChange={setMaterial}
              onMealTypeChange={setMealType}
              onMealNameChange={setMealName}
              currentMealType={mealType}
              //受信したデータから表示用に必要な情報をを作り、Stateに格納と同時に結果表示用のモーダルオープン
              onCalculate={(data) => {
                setAiResult({
                  meal_name: mealName,
                  calorie: `${data.totalCalories} kcal`,
                  comment:`P:${data.protein}g / F:${data.fat}g / C:${data.carbo}g`,
                  totalCalories: data.totalCalories,
                  protein:data.protein,
                  fat: data.fat,
                  carbo:data.carbo
                });
                setResultModalOpen(true);
              }}
            />
            <CalorieResultModal
              isOpen={resultModalOpen}
              onOpenChange={setResultModalOpen}
              //aiResultがresultDataとしてpropsに渡す。
              resultData={aiResult}
            />

          </div>
          
        
    </Dialog> 
    );
  }
