// import React from 'react';
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogHeader,
//   DialogTitle,
// } from '@/components/ui/dialog';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import { Separator } from '@/components/ui/separator';
// import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
// import { 
//   Bot, 
//   Lightbulb, 
//   BookOpen, 
//   CheckCircle, 
//   XCircle,
//   Loader2
// } from 'lucide-react';
// import { ReviewQuestion, AIExplanationResponse } from '../types/practiceTypes';

// interface AIExplanationDialogProps {
//   open: boolean;
//   onOpenChange: (open: boolean) => void;
//   question: ReviewQuestion;
//   explanation: AIExplanationResponse | null;
//   loading: boolean;
//   onClose: () => void;
// }

// const AIExplanationDialog: React.FC<AIExplanationDialogProps> = ({
//   open,
//   onOpenChange,
//   question,
//   explanation,
//   loading,
//   onClose,
// }) => {
//   const optionLabels = ['A', 'B', 'C', 'D', 'E'];

//   const getOptionStatus = (optionIndex: number) => {
//     const isCorrect = optionIndex === question.correctAnswer;
//     const isUserAnswer = optionIndex === question.userAnswer;
    
//     if (isCorrect) {
//       return 'correct';
//     } else if (isUserAnswer && !isCorrect) {
//       return 'incorrect';
//     }
//     return 'neutral';
//   };

//   const getOptionIcon = (optionIndex: number) => {
//     const isCorrect = optionIndex === question.correctAnswer;
//     const isUserAnswer = optionIndex === question.userAnswer;
    
//     if (isCorrect) {
//       return <CheckCircle className="h-4 w-4 text-green-600" />;
//     } else if (isUserAnswer && !isCorrect) {
//       return <XCircle className="h-4 w-4 text-red-600" />;
//     }
//     return null;
//   };

//   return (
//     <Dialog open={open} onOpenChange={onOpenChange}>
//       <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
//         <DialogHeader>
//           <DialogTitle className="flex items-center gap-2">
//             <Bot className="h-5 w-5" />
//             AI Explanation
//           </DialogTitle>
//           <DialogDescription>
//             Get detailed explanation and reasoning for this question
//           </DialogDescription>
//         </DialogHeader>

//         <div className="space-y-6">
//           {/* Question Summary */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Question Summary</CardTitle>
//             </CardHeader>
//             <CardContent className="space-y-4">
//               <div className="flex items-center gap-4 flex-wrap">
//                 <Badge variant="outline">
//                   {question.subject}
//                 </Badge>
//                 {question.examType && question.examYear && (
//                   <Badge variant="outline">
//                     {question.examType} {question.examYear}
//                   </Badge>
//                 )}
//                 <Badge 
//                   variant={question.isCorrect ? "default" : "destructive"}
//                   className={question.isCorrect ? "bg-green-100 text-green-800" : ""}
//                 >
//                   {question.isCorrect ? "Correct" : "Incorrect"}
//                 </Badge>
//               </div>

//               <div 
//                 className="prose max-w-none text-sm"
//                 dangerouslySetInnerHTML={{ __html: question.text }}
//               />

//               {question.imageUrl && (
//                 <div className="flex justify-center">
//                   <img 
//                     src={question.imageUrl} 
//                     alt="Question" 
//                     className="max-w-full h-auto rounded-lg border"
//                     style={{ maxHeight: '300px' }}
//                   />
//                 </div>
//               )}
//             </CardContent>
//           </Card>

//           {/* Options Review */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="text-lg">Options Review</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-3">
//                 {question.options.map((option, index) => {
//                   const status = getOptionStatus(index);
//                   const baseClasses = "flex items-start gap-3 p-3 rounded-lg border";
//                   let optionClasses = baseClasses;
                  
//                   switch (status) {
//                     case 'correct':
//                       optionClasses = `${baseClasses} bg-green-50 border-green-200`;
//                       break;
//                     case 'incorrect':
//                       optionClasses = `${baseClasses} bg-red-50 border-red-200`;
//                       break;
//                     default:
//                       optionClasses = `${baseClasses} bg-muted/30`;
//                   }

//                   return (
//                     <div key={index} className={optionClasses}>
//                       <div className="flex-shrink-0 w-6 h-6 rounded-full border-2 border-current flex items-center justify-center text-xs font-medium">
//                         {question.optionAlphas?.[index] || optionLabels[index]}
//                       </div>
                      
//                       <div className="flex-1 min-w-0">
//                         <div 
//                           className="text-sm"
//                           dangerouslySetInnerHTML={{ __html: option }}
//                         />
//                       </div>
                      
//                       {getOptionIcon(index)}
//                     </div>
//                   );
//                 })}
//               </div>

//               <div className="mt-4 p-3 bg-muted/50 rounded-lg">
//                 <div className="flex items-center gap-4 text-sm">
//                   <span>Your Answer: 
//                     <Badge variant="outline" className="ml-1">
//                       {question.userAnswer !== undefined 
//                         ? question.optionAlphas?.[question.userAnswer] || optionLabels[question.userAnswer]
//                         : 'Not Attempted'
//                       }
//                     </Badge>
//                   </span>
//                   <span>Correct Answer: 
//                     <Badge variant="outline" className="ml-1 text-green-600 border-green-300">
//                       {question.optionAlphas?.[question.correctAnswer || 0] || optionLabels[question.correctAnswer || 0]}
//                     </Badge>
//                   </span>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           {/* AI Explanation */}
//           <Card>
//             <CardHeader>
//               <CardTitle className="flex items-center gap-2">
//                 <Bot className="h-5 w-5" />
//                 AI Explanation
//               </CardTitle>
//             </CardHeader>
//             <CardContent>
//               {loading ? (
//                 <div className="flex items-center justify-center py-8">
//                   <div className="text-center">
//                     <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
//                     <p className="text-muted-foreground">Generating AI explanation...</p>
//                   </div>
//                 </div>
//               ) : explanation ? (
//                 <div className="space-y-6">
//                   {/* Main Explanation */}
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-2">
//                       <BookOpen className="h-4 w-4 text-blue-600" />
//                       <h4 className="font-semibold">Explanation</h4>
//                     </div>
//                     <div className="prose max-w-none text-sm leading-relaxed">
//                       {explanation.explanation}
//                     </div>
//                   </div>

//                   <Separator />

//                   {/* Reasoning */}
//                   <div className="space-y-3">
//                     <div className="flex items-center gap-2">
//                       <Lightbulb className="h-4 w-4 text-yellow-600" />
//                       <h4 className="font-semibold">Reasoning</h4>
//                     </div>
//                     <div className="prose max-w-none text-sm leading-relaxed">
//                       {explanation.reasoning}
//                     </div>
//                   </div>

//                   {/* Study Tips */}
//                   {explanation.tips && explanation.tips.length > 0 && (
//                     <>
//                       <Separator />
//                       <div className="space-y-3">
//                         <div className="flex items-center gap-2">
//                           <Lightbulb className="h-4 w-4 text-green-600" />
//                           <h4 className="font-semibold">Study Tips</h4>
//                         </div>
//                         <ul className="space-y-2">
//                           {explanation.tips.map((tip, index) => (
//                             <li key={index} className="flex items-start gap-2 text-sm">
//                               <span className="flex-shrink-0 w-1.5 h-1.5 bg-primary rounded-full mt-2"></span>
//                               <span>{tip}</span>
//                             </li>
//                           ))}
//                         </ul>
//                       </div>
//                     </>
//                   )}
//                 </div>
//               ) : (
//                 <div className="text-center py-8 text-muted-foreground">
//                   <Bot className="h-12 w-12 mx-auto mb-4 opacity-50" />
//                   <p>No explanation available</p>
//                 </div>
//               )}
//             </CardContent>
//           </Card>
//         </div>

//         <div className="flex justify-end gap-2 pt-4">
//           <Button variant="outline" onClick={onClose}>
//             Close
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// };

// export default AIExplanationDialog; 