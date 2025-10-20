//CalorieResultModal.tsx

'use client'

import {useState} from 'react';
import{Button} from "@/components/ui/button"
import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { matchesGlob } from 'path';

interface CalorieResultModalProps{
    isOpen:boolean;
    onOpenChange:(open:boolean) => void;
    resultData: {
        totalCalories?:number;
        protein?:number;
        fat?:number;
        carbo?:number;
        meal_name: string;
        calorie: string;
        comment: string} | null;
        imageSrcBase64:string | null;
        
}

export default function CalorieResultModal({
    isOpen,
    onOpenChange,
    resultData,
    imageSrcBase64,

}:CalorieResultModalProps){
    
    return(
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>
                        カロリー詳細結果
                    </DialogTitle>
                </DialogHeader>
                <div className="flex">
                    <div className="w-1/2 p-4">
                        <div className="relative w-full h-[200px] border border-gray-300 flex items-center justify-center">
                            {imageSrcBase64 ? (
                                <Image
                                        src={imageSrcBase64}
                                        alt="Preview"
                                        layout="fill"
                                        objectFit="contain"
                                />
                            ):(
                                //画像が未選択の場合
                                <span className="text-gray-500">画像がありません</span>
                            )}
                        </div>
                        {resultData ? (
                            <div>
                                <p><strong>料理名：</strong>{resultData.meal_name}</p>
                                <p><strong>カロリー：</strong>{resultData.totalCalories || '不明'} kcal</p>
                                <p><strong>タンパク質：</strong>{resultData.protein || '不明'} g</p>
                                <p><strong>脂質：</strong>{resultData.fat || '不明'} g</p>
                                <p><strong>炭水化物：</strong>{resultData.carbo || '不明'} g</p>
                                
                            </div>
                        ) : (
                        <p>まだ結果がありません</p>
                        )}
                    </div>
                    
                </div>
            </DialogContent>
        </Dialog>
    )
}