//CalorieHistoryModal.tsx

'use client'

import Image from 'next/image'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area" // スクロール領域のために必要に応じて追加

interface DailyMealDetail{
    id:number;
    mealname:string;
    calories:string;
    protein:string;
    fat:string;
    carbs:string;
    mealtime:string;
    picture:string | null;
    created_at:string | null;
}

interface CalorieHistoryModalProps{
    isOpen:boolean;
    onOpenChange:(open:boolean) => void;
    //詳細データの配列を受け取るように型を修正
    historyData:DailyMealDetail[];
    selectedDate: string | null;
}

//食事の順序を定義
const MEAL_ORDER:{[keyof: string]:number} = {
    'breakfast':1,
    'lunch':2,
    'dinner':3,

    '朝食':1,
    '昼食':2,
    '夕食':3,
};

//データベースの値を日本語表示にする
const MEAL_TRANSLATTIONS:{[key:string]:string} = {
    'breakfast':'朝食',
    'lunch':'昼食',
    'dinner':'夕食',
};

export default function CalorieHistoryModal({
    isOpen,
    onOpenChange,
    historyData,
    selectedDate,
}:CalorieHistoryModalProps){

    //データを表示順にソート
    const sortedHistory = historyData.sort((a,b) => {
        //mealtimeに基づいて順序を決定
        const orderA = MEAL_ORDER[a.mealtime] || 99;
        const orderB = MEAL_ORDER[b.mealtime] || 99;

        if (orderA !== orderB) {
            return orderA - orderB;
        }

        //mealtimeが同じ場合、created_atでサブソート
        const dateA = a.created_at || "";
        const dateB = b.created_at || "";

        return dateA.localeCompare(dateB);//日付文字列で比較(昇順)
    });

    //日付を整形(YYYY年M月D日)
    const formattedDate = selectedDate
        ? new Date(selectedDate).toLocaleDateString('ja-JP',{year:'numeric',month:'long',day: 'numeric'})
        :'選択された日';

        return (
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden'>
                    <DialogHeader>
                        <DialogTitle className='text-3xl fontbold'>
                            {formattedDate}の食事履歴
                        </DialogTitle>
                    </DialogHeader>
                

                {/* ソートされたデータをリスト表示 */}
                <ScrollArea className='h-[75vh] pr-4'>
                    {sortedHistory.length === 0 ?(
                        <p className='text-gray-500 p-4'>この日の詳細な食事記録はありません</p>
                    ):(
                        <div className='space-y-6'>
                            {sortedHistory.map((meal) => (
                                <div key={meal.id} className='flex border rounded-lg shadow-sm overflow-hidden p-4'>
                                    {/* 左側：画像 */}
                                    <div className='w-1/3 flex-shrink-0 relative h-40 bg-gray-100 rounded-lg overflow-hidden'>
                                        {meal.picture ? (
                                            <Image
                                                src={meal.picture}
                                                alt={meal.mealname}
                                                layout="fill"
                                                objectFit="cover"
                                                priority//画像を優先的にロード
                                            />
                                        ):(
                                            <div className='flex items-center justify-center h-full text-gray-400'>
                                                画像なし
                                            </div>
                                        )}
                                    </div>

                                    {/* 右側：詳細情報 */}
                                    <div className='w-2/3 pl-6'>
                                        <h3 className='text-2xl font-semibold text-blue-6000 mb-2'>
                                            {/* 日本語変換のためmeal.timeをMEAL_TRANSLATIONSに通す */}
                                            {MEAL_TRANSLATTIONS[meal.mealtime] || meal.mealtime} - {meal.mealname}
                                        </h3>

                                        <div className='space-y-1 text-lg'>
                                            <p><strong>カロリー：</strong>{meal.calories}kcal</p>
                                            <p><strong>タンパク質：</strong>{meal.protein}g</p>
                                            <p><strong>脂質：</strong>{meal.fat}g</p>
                                            <p><strong>炭水化物：</strong>{meal.carbs}g</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </DialogContent>
        </Dialog>
        );
}
