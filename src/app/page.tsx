

'use client'
import {useState} from 'react';
import Head from 'next/head';
import{Button} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import{POST} from '../../../my-next-app/server-actions/calorie_ai'
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
export default function Home() {
  const[imageFile,setImageFile] = useState<File | null>(null);
  const[material,setMaterial] = useState<string>("");
  const[mealName,setMealName] = useState<string>("");
  const[loading,setLoading] = useState(false);
  const[result,setResult] = useState<CalorieResult | null>(null);
  const[error,setError] = useState<string | null>(null);
    return(
    
        
    <Dialog>
       <DialogHeader className="bg-green-300 h-25">
          <DialogTitle className="text-5xl text-center mt-5">
            カロリー計算アプリ
          </DialogTitle>
        </DialogHeader>
        <div className="flex gap-10 items-start">
          <div className="flex-col ">
            <div className=" border rounded mt-10 ml-10 w-200 h-110 flex items-center justify-center">
              <Dialog>
                <DialogTrigger asChild>
                  <Button className=" bg-blue-500 hover:bg-blue-400 text-white text-5xl font-bold border w-24 h-24 rounded-full flex items-center justify-center">
                    +
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>食事を追加</DialogTitle>
                    <DialogDescription>
                      
                    </DialogDescription>
                  </DialogHeader>
                </DialogContent>
              </Dialog>
            </div>
            <div className="flex">
              <input className="border border-black-500 rounded-md h-12 w-140 mt-3 ml-10 text-center flex items-center bg-gray-100"
                     placeholder='例：カレーライス'
                     value={mealName || ""}
                     onChange={ (m) => {
                      setMealName(mealName)
                     }}>
              </input>
              <Button className="border border-black-500 rounded-md h-12 w-50 mt-3 ml-10 text-center flex-items-center bg-blue-500 hover:bg-blue-400">
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
          </div>
          
        
    </Dialog>
    
    
    );
  }
