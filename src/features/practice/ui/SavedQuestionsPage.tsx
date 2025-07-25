import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  BookOpen, 
  Trash2, 
  Eye, 
  Calendar,
  Star,
  MoreVertical,
  GridIcon,
  List,
  BookMarked,
  MessageSquare,
  Share2,
  Copy as CopyIcon,
  Flag
} from 'lucide-react';
import Layout from '@/components/common/Layout';
import { ReviewQuestion } from '../types/practiceTypes';

// Dummy data for saved questions
const dummySavedQuestions: (ReviewQuestion & { dateSaved: string; difficulty: 'Easy' | 'Medium' | 'Hard' })[] = [
  {
    id: '1',
    text: 'What is the primary function of the respiratory system in humans? What is the primary function of the respiratory system in humans? What is the primary function of the respiratory system in humans?',
    options: [
      'To circulate blood throughout the body',
      'To exchange oxygen and carbon dioxide',
      'To digest food and absorb nutrients',
      'To filter waste products from blood'
    ],
    correctAnswer: 1,
    subject: 'Biology',
    examType: 'JAMB',
    examYear: '2023',
    section: 'Biology',
    userAnswer: 1,
    isCorrect: true,
    isSaved: true,
    dateSaved: '2024-01-15',
    difficulty: 'Medium'
  },
  {
    id: '2',
    text: 'Solve for x in the equation: 2x + 5 = 17',
    options: ['x = 4', 'x = 6', 'x = 8', 'x = 10'],
    correctAnswer: 1,
    subject: 'Mathematics',
    examType: 'WAEC',
    examYear: '2023',
    section: 'General Mathematics',
    userAnswer: 0,
    isCorrect: false,
    isSaved: true,
    dateSaved: '2024-01-12',
    difficulty: 'Easy'
  },
  {
    id: '3',
    text: 'Which of the following best describes photosynthesis?',
    options: [
      'The process by which plants convert sunlight into chemical energy',
      'The breakdown of glucose for energy release',
      'The transport of water in plants',
      'The reproduction process in flowering plants'
    ],
    correctAnswer: 0,
    subject: 'Biology',
    examType: 'NECO',
    examYear: '2022',
    section: 'Biology',
    userAnswer: 0,
    isCorrect: true,
    isSaved: true,
    dateSaved: '2024-01-10',
    difficulty: 'Medium'
  },
  {
    id: '4',
    text: 'What is the capital of Nigeria?',
    options: ['Lagos', 'Abuja', 'Kano', 'Port Harcourt'],
    correctAnswer: 1,
    subject: 'Geography',
    examType: 'JAMB',
    examYear: '2023',
    section: 'Geography',
    userAnswer: 1,
    isCorrect: true,
    isSaved: true,
    dateSaved: '2024-01-08',
    difficulty: 'Easy'
  },
  {
    id: '5',
    text: 'In which year did Nigeria gain independence?',
    options: ['1958', '1960', '1962', '1963'],
    correctAnswer: 1,
    subject: 'History',
    examType: 'WAEC',
    examYear: '2023',
    section: 'History',
    userAnswer: 2,
    isCorrect: false,
    isSaved: true,
    dateSaved: '2024-01-05',
    difficulty: 'Easy'
  },
  {
    id: '6',
    text: 'Calculate the derivative of f(x) = x³ + 2x² - 5x + 1',
    options: ['3x² + 4x - 5', '3x² + 4x + 5', 'x² + 4x - 5', '3x + 4x - 5'],
    correctAnswer: 0,
    subject: 'Mathematics',
    examType: 'JAMB',
    examYear: '2023',
    section: 'Mathematics',
    userAnswer: 0,
    isCorrect: true,
    isSaved: true,
    dateSaved: '2024-01-03',
    difficulty: 'Hard'
  }
];

const SavedQuestionsPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [questions] = useState(dummySavedQuestions);

  // Filter questions based on search and filters
  const filteredQuestions = questions.filter(question => {
    const matchesSearch = question.text.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         question.subject.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesSubject = selectedSubject === 'all' || question.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  // Get unique values for filters
  const subjects = [...new Set(questions.map(q => q.subject))];

  // Calculate stats
  const totalQuestions = questions.length;
  const correctAnswers = questions.filter(q => q.isCorrect).length;
  const accuracy = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;

  const handleRemoveQuestion = (questionId: string) => {
    // TODO: Implement remove functionality
    console.log('Remove question:', questionId);
  };

  const handleViewQuestion = (questionId: string) => {
    // TODO: Implement view full question functionality
    console.log('View question:', questionId);
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Easy': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Hard': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Layout title="Saved Questions">
      <div className="space-y-6">
        {/* Header with Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <BookMarked className="h-8 w-8 text-blue-600" />
                <div>
                  <p className="text-2xl font-bold">{totalQuestions}</p>
                  <p className="text-sm text-muted-foreground">Total Saved</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <Star className="h-8 w-8 text-green-600" />
                <div>
                  <p className="text-2xl font-bold">{correctAnswers}</p>
                  <p className="text-sm text-muted-foreground">Answered Correctly</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search questions..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex items-center gap-3">
                <Select value={selectedSubject} onValueChange={setSelectedSubject}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Subject" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Subjects</SelectItem>
                    {subjects.map(subject => (
                      <SelectItem key={subject} value={subject}>{subject}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <div className="flex border rounded-lg">
                  <Button
                    variant={viewMode === 'grid' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('grid')}
                    className="rounded-r-none"
                  >
                    <GridIcon className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === 'list' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('list')}
                    className="rounded-l-none"
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Questions Grid/List */}
        {filteredQuestions.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <BookMarked className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">No saved questions found</h3>
              <p className="text-muted-foreground">
                {searchTerm || selectedSubject !== 'all'
                  ? 'Try adjusting your search criteria or filters.'
                  : 'Start saving questions from your practice tests to see them here.'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className={viewMode === 'grid' 
            ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6' 
            : 'space-y-4'
          }>
            {filteredQuestions.map((question) => (
              <Card key={question.id} className="group hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="outline">{question.subject}</Badge>
                        <Badge variant="outline">{question.examType} {question.examYear}</Badge>
                      </div>
                      <CardTitle 
                        className="text-base leading-relaxed line-clamp-2"
                      >
                        {question.text}
                      </CardTitle>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleViewQuestion(question.id)}>
                          <Eye className="h-4 w-4 mr-2" />
                          View
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: Add note logic */}}>
                          <MessageSquare className="h-4 w-4 mr-2" />
                          Add Note
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: Share logic */}}>
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: Copy logic */}}>
                          <CopyIcon className="h-4 w-4 mr-2" />
                          Copy
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => {/* TODO: Report issue logic */}}>
                          <Flag className="h-4 w-4 mr-2 text-red-600" />
                          Report Issue
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleRemoveQuestion(question.id)} className="text-red-600">
                          <Trash2 className="h-4 w-4 mr-2" />
                          Remove from Saved
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-3">
                    {/* Answer Status */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Your Answer:</span>
                      <Badge 
                        variant="outline" 
                        className={question.isCorrect 
                          ? 'bg-green-50 text-green-700 border-green-200' 
                          : 'bg-red-50 text-red-700 border-red-200'
                        }
                      >
                        {question.isCorrect ? 'Correct' : 'Incorrect'}
                      </Badge>
                    </div>
                    
                    <Separator />
                    
                    {/* Date Saved */}
                    <div className="flex items-center justify-between text-sm text-muted-foreground">
                      <span>Saved on:</span>
                      <span>{new Date(question.dateSaved).toLocaleDateString()}</span>
                    </div>
                  </div>
                </CardContent>
                
                {/* <CardContent className="pt-0">
                  <div className="flex gap-2">
                    <Button 
                      size="sm" 
                      variant="outline" 
                      className="flex-1"
                      onClick={() => handleViewQuestion(question.id)}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      onClick={() => handleRemoveQuestion(question.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent> */}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default SavedQuestionsPage; 