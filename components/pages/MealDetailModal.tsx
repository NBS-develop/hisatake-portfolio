//MealDetailModal.tsx

'use client'

import {useEffect, useState} from 'react';
import{Button} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

//ServerActions
import{calculateCalorie}from'../../server-actions/calorie_ai';
import {RadioGroup,RadioGroupItem} from "@/components/ui/radio";
import { Label } from "@/components/ui/label";
import Image from "next/image";
type MealType = 'breakfast' | 'lunch' | 'dinner' |null;

interface CalorieDetailModalProps{
  onMealTypeChange: (value: MealType) => void;
  onMaterialChange: (value: string) => void
  currentMealType: MealType;
  onCalculate: (data?:any) => void;
  isOpen:boolean;
  onOpenChange: (open: boolean) => void;
  onMealNameChange: (value: string) => void;
  imageFile: File | null;
  imageSrcBase64:string | null;
}

export default function CalorieDetailModal({
    onMealTypeChange,
    onMaterialChange,
    currentMealType,
    isOpen,
    onOpenChange,
    onCalculate,
    onMealNameChange,
    imageFile,
    imageSrcBase64
}:CalorieDetailModalProps){
    const[material,setMaterial] = useState<string>("");
    const[mealName,setMealName] = useState<string>("");
    const[isLoading,setIsLoading] = useState(false);
    const[lastRequestTime,setLastRequestTime] = useState<number>(0);

    //モーダルが閉じたときStateをクリーンアップ
    useEffect(() => {
        if (!isOpen) {
            const timer = setTimeout(() => {
                setIsLoading(false);
            },300);
            return () => clearTimeout(timer);
        } 
    },[isOpen]);

    const handleSend = async () =>{

        if(!mealName || !material){
            alert("料理名と材料を入力してください");
            return;
        }
        if(!currentMealType) {
            alert("朝食 昼食 夕食を選択してください");
            return;
        }
        //ここで送りたいデータをまとめる
        const formData = new FormData();
        formData.append("meal_name",mealName);
        formData.append("material",material);
        formData.append("meal_type",currentMealType || "");
        if(imageFile){
            formData.append("image",imageFile) ;
        }

        setIsLoading(true);
        try{

            //サーバーから返された結果を受け取る
             const data = await calculateCalorie(formData);//サーバーに送信、受け取り
             console.log("AIの結果",data);
             onCalculate(data);//←page.tsxに渡す
             onOpenChange(false);
            

        }catch(err){
         console.error(err);
         if (err instanceof Error) {
            if(err.message.includes('タイムアウト')){
                alert("処理時間に時間がかかりすぎています。もう一度お試しください。");
            }else if(err.message.includes('Rate limit')){
                alert('APIの利用制限に達しました。少し時間をおいてから再度お試しください。');
            }else {
                alert(`エラー:${err.message}`);
            }
         }else {
            alert("AIとの通信に失敗しました。");
         }
        }finally{
            setIsLoading(false);
        }
    }
    
    return(
        <Dialog open={isOpen} onOpenChange={onOpenChange} >
            <DialogContent className=" bg-white sm:max-w-[800px] md:w-[800px] h-auto max-h-[90vh] flex flex-col overflow-y-auto" >
                <DialogHeader className="bg-green-300 h-12">
                    <DialogTitle className="text-2xl text-center mt-2">
                        食事詳細
                    </DialogTitle>
                </DialogHeader>
                <div className="flex justify-between p-4">
                    <div className="flex flex-col space-y-4 w-1/2">   
                        <RadioGroup 
                            value={currentMealType ?? ""}
                            onValueChange={(val) => onMealTypeChange(val as MealType)}
                        >
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="breakfast" id="breakfast" />
                                <Label htmlFor="breakfast">朝食</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="lunch" id="lunch" />
                                <Label htmlFor="lunch">昼食</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="dinner" id="dinner" />
                                <Label htmlFor="dinner">夕食</Label>
                            </div>
                        </RadioGroup>
                    <p className="text-2xl font-bold ml-25 mt-3">材料</p>
                        
                        <textarea 
                            className="border border-black-500 rounded-md p-2 w-full h-[150px] mt-2 resize-none"
                            placeholder="例：人参：2分の1本、じゃがいも2個・・・"
                            value={material}
                            onChange={ (e) => {
                                setMaterial(e.target.value)
                                onMaterialChange(e.target.value)
                            }}
                        />
                    </div>

                    <div className="flex flex-col  space-y-5 w-1/2 items-center">
                        <div className=" relative border rounded w-[300px] h-[200px] flex items-center justify-center">
                            <div className = "w-60 h-50">
                                {imageSrcBase64 ? (
                                    <Image
                                        src={imageSrcBase64}
                                        alt="Preview"
                                        layout="fill"
                                        objectFit="contain" 
                                    /> 
                                ):(
                                    <span className="text-gray-500">画像がありません</span>
                                )};
                            </div>

                            
                        </div>
                        <div>
                            <input className="border border-black-500 rounded-md h-12 w-[300px]  text-center flex items-center bg-gray-100"
                                placeholder="例：カレーライス"
                                value={mealName}//入力されたものを表示
                                onChange={ (e) => {
                                    setMealName(e.target.value);
                                    onMealNameChange(e.target.value);//親に料理名送る用
                                }}
                            />
                        </div>
                        <div>
                            <Button className="text-2xl border border-black-500 rounded-md h-12 w-[300px] mt-3 ml-10 text-center flex-items-center bg-blue-500 hover:bg-blue-400"
                                    onClick={handleSend}
                                    disabled={isLoading}
                            >
                                {isLoading ? '計算中...':'計算'}
                            </Button>
                        </div>

                    </div>
                </div>

            </DialogContent>

        </Dialog>

    )
}



