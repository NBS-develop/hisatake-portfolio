//MealDetailModal.tsx

'use client'

import {useState} from 'react';
import{Button} from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

import {RadioGroup,RadioGroupItem} from "@/components/ui/radio";
import { Label } from "@/components/ui/label";

type MealType = 'breakfast' | 'lunch' | 'dinner' |null;

interface CalorieDetailModalProps{
  onMealTypeChange: (value: MealType) => void;
  onMaterialChange: (value: string) => void
  currentMealType: MealType;
  onCalculate: () => void;
  isOpen:boolean;
  onOpenChange: (open: boolean) => void;
}

export default function CalorieDetailModal({
    onMealTypeChange,
    currentMealType,
    isOpen,
    onOpenChange,
    onCalculate,
}:CalorieDetailModalProps){
    const[material,setMaterial] = useState<string>("");
    return(
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="bg-white max-w-[900px] w-full h-auto max-h-[90vh] flex flex-col overflow-y-auto" >
                <DialogHeader className="bg-green-300 h-12 rounded-t-lg">
                    <DialogTitle className="text-2xl text-center mt-2">
                        食事詳細
                    </DialogTitle>
                </DialogHeader>
                <div className="flex justify-between gap-6 p-6">
                    <div className="flex flex-col flex-1">   
                        <RadioGroup defaultValue="option-one">
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-one" id="option-one" />
                                <Label htmlFor="option-one">朝食</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-two" id="option-two" />
                                <Label htmlFor="option-two">昼食</Label>
                            </div>
                            <div className="flex items-center space-x-2">
                                <RadioGroupItem value="option-three" id="option-three" />
                                <Label htmlFor="option-three">夕食</Label>
                            </div>
                        </RadioGroup>
                        <p className="text-2xl font-bold mt-6">材料</p>
                        <input 
                            className="border border-gray-500 rounded-md w-full h-24 px-3 py-2 mt-2"
                            placeholder="人参：2分の1本"
                            value={material || ""}
                            onChange={ (e) => {
                                setMaterial(e.target.value)
                            }}
                        />
                    </div>

                    <div className="flex flex-col gap-4 flex-1">
                        <div className="border border-gray-300 rounded mt-10 w-full h-40 flex items-center justify-center bg-gray-50">
                            <p className="text-gray-400">（画像）</p>
                        </div>
                        <div className="border border-gray-500 rounded-md h-12 w-full text-center flex items-center justify-center bg-gray-100">
                            <p className="text-gray-600">（料理名）</p>
                        </div>
                    </div>
                </div>
                
            </DialogContent>

        </Dialog>

    )
}



