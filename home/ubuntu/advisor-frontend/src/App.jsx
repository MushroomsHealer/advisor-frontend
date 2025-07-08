import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Textarea } from '@/components/ui/textarea.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { MessageCircle, Brain, Shield, Eye, Send, Star, ThumbsUp, ThumbsDown, AlertCircle } from 'lucide-react'
import './App.css'

const API_BASE_URL = 'https://advisor-proto-agi.onrender.com'

function App() {
  const [message, setMessage] = useState('')
  const [response, setResponse] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [feedback, setFeedback] = useState({ rating: 0, comment: '' })
  const [showFeedback, setShowFeedback] = useState(false)
  
  // Состояния для навигационных вкладок
  const [roadmapData, setRoadmapData] = useState(null)
  const [userStoriesData, setUserStoriesData] = useState(null)
  const [architectureData, setArchitectureData] = useState(null)
  const [legalData, setLegalData] = useState(null)
  const [tabLoading, setTabLoading] = useState({})
  const [tabErrors, setTabErrors] = useState({})

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!message.trim()) return

    setLoading(true)
    setError(null)
    setResponse(null)
    
    try {
      const res = await fetch(`${API_BASE_URL}/ask`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message }),
      })
      
      if (res.ok) {
        const data = await res.json()
        setResponse(data)
        setShowFeedback(true)
      } else {
        const errorData = await res.json().catch(() => ({ error: 'Неизвестная ошибка' }))
        setError(errorData.error || `Ошибка сервера: ${res.status}`)
      }
    } catch (error) {
      console.error('Error:', error)
      setError('Ошибка подключения к серверу. Проверьте интернет-соединение.')
    } finally {
      setLoading(false)
    }
  }

  const submitFeedback = async () => {
    if (!response || feedback.rating === 0) return

    try {
      const res = await fetch(`${API_BASE_URL}/feedback`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          user_message: message,
          advisor_response: JSON.stringify(response),
          rating: feedback.rating,
          comment: feedback.comment,
        }),
      })
      
      if (res.ok) {
        setShowFeedback(false)
        setFeedback({ rating: 0, comment: '' })
      }
    } catch (error) {
      console.error('Error submitting feedback:', error)
    }
  }

  // Функции загрузки данных для навигационных вкладок
  const loadTabData = async (endpoint, setData, tabName) => {
    if (tabLoading[tabName]) return
    
    setTabLoading(prev => ({ ...prev, [tabName]: true }))
    setTabErrors(prev => ({ ...prev, [tabName]: null }))
    
    try {
      const res = await fetch(`${API_BASE_URL}/${endpoint}`)
      if (res.ok) {
        const data = await res.json()
        setData(data)
      } else {
        setTabErrors(prev => ({ ...prev, [tabName]: `Ошибка загрузки: ${res.status}` }))
      }
    } catch (error) {
      console.error(`Error loading ${tabName}:`, error)
      setTabErrors(prev => ({ ...prev, [tabName]: 'Ошибка подключения к серверу' }))
    } finally {
      setTabLoading(prev => ({ ...prev, [tabName]: false }))
    }
  }

  const loadRoadmap = () => loadTabData('roadmap', setRoadmapData, 'roadmap')
  const loadUserStories = () => loadTabData('user-stories', setUserStoriesData, 'userStories')
  const loadArchitecture = () => loadTabData('architecture', setArchitectureData, 'architecture')
  const loadLegal = () => loadTabData('legal', setLegalData, 'legal')

  const ResponseBlock = ({ icon: Icon, title, content, color }) => (
    <Card className={`border-l-4 ${color}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Icon className="h-5 w-5" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm leading-relaxed">{content}</p>
      </CardContent>
    </Card>
  )

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="container mx-auto px-4 py-8">
          <header className="text-center mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              Advisor AGI
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Умный AI-консультант с этичными и обоснованными советами
            </p>
          </header>

          <Tabs defaultValue="chat" className="max-w-4xl mx-auto">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="chat">Чат</TabsTrigger>
              <TabsTrigger value="roadmap">Roadmap</TabsTrigger>
              <TabsTrigger value="stories">User Stories</TabsTrigger>
              <TabsTrigger value="architecture">Архитектура</TabsTrigger>
              <TabsTrigger value="legal">Legal</TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5" />
                    Задайте ваш вопрос
                  </CardTitle>
                  <CardDescription>
                    Получите структурированный совет с обоснованием и этической оценкой
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <Textarea
                      placeholder="Опишите вашу ситуацию или задайте вопрос..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="min-h-[100px]"
                    />
                    <Button type="submit" disabled={loading || !message.trim()} className="w-full">
                      {loading ? (
                        <div className="flex items-center gap-2">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                          Обрабатываю...
                        </div>
                      ) : (
                        <div className="flex items-center gap-2">
                          <Send className="h-4 w-4" />
                          Получить совет
                        </div>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>

              {error && (
                <Card className="border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
                      <AlertCircle className="h-5 w-5" />
                      <p className="font-medium">Ошибка</p>
                    </div>
                    <p className="text-red-600 dark:text-red-400 mt-2">{error}</p>
                  </CardContent>
                </Card>
              )}

              {response && (
                <div className="space-y-4">
                  <ResponseBlock
                    icon={Brain}
                    title="Совет"
                    content={response.advice}
                    color="border-l-blue-500"
                  />
                  <ResponseBlock
                    icon={Eye}
                    title="Обоснование"
                    content={response.reasoning_path}
                    color="border-l-green-500"
                  />
                  <ResponseBlock
                    icon={Shield}
                    title="Этическая оценка"
                    content={response.ethical_check}
                    color="border-l-yellow-500"
                  />
                  <ResponseBlock
                    icon={MessageCircle}
                    title="Самооценка"
                    content={response.self_reflection}
                    color="border-l-purple-500"
                  />

                  {showFeedback && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Оцените ответ</CardTitle>
                        <CardDescription>
                          Ваша обратная связь поможет улучшить качество советов
                        </CardDescription>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="flex gap-2">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <Button
                              key={star}
                              variant={feedback.rating >= star ? "default" : "outline"}
                              size="sm"
                              onClick={() => setFeedback({ ...feedback, rating: star })}
                            >
                              <Star className="h-4 w-4" />
                            </Button>
                          ))}
                        </div>
                        <Textarea
                          placeholder="Дополнительные комментарии (необязательно)"
                          value={feedback.comment}
                          onChange={(e) => setFeedback({ ...feedback, comment: e.target.value })}
                        />
                        <div className="flex gap-2">
                          <Button onClick={submitFeedback} disabled={feedback.rating === 0}>
                            <ThumbsUp className="h-4 w-4 mr-2" />
                            Отправить отзыв
                          </Button>
                          <Button variant="outline" onClick={() => setShowFeedback(false)}>
                            Пропустить
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}
            </TabsContent>

            <TabsContent value="roadmap">
              <Card>
                <CardHeader>
                  <CardTitle>Roadmap проекта</CardTitle>
                  <CardDescription>
                    План развития Advisor AGI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!roadmapData && !tabLoading.roadmap && !tabErrors.roadmap && (
                    <div className="text-center">
                      <Button onClick={loadRoadmap} variant="outline">
                        Загрузить roadmap
                      </Button>
                    </div>
                  )}
                  
                  {tabLoading.roadmap && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                      Загрузка roadmap...
                    </div>
                  )}
                  
                  {tabErrors.roadmap && (
                    <div className="text-red-600 dark:text-red-400">
                      {tabErrors.roadmap}
                      <Button onClick={loadRoadmap} variant="outline" size="sm" className="ml-2">
                        Повторить
                      </Button>
                    </div>
                  )}
                  
                  {roadmapData && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">{roadmapData.title}</h3>
                      <div className="grid gap-4">
                        {roadmapData.phases?.map((phase) => (
                          <Card key={phase.id} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{phase.title}</CardTitle>
                                <Badge variant={phase.status === 'in_progress' ? 'default' : phase.status === 'planned' ? 'secondary' : 'outline'}>
                                  {phase.status === 'in_progress' ? 'В процессе' : 
                                   phase.status === 'planned' ? 'Запланировано' : 
                                   phase.status === 'research' ? 'Исследование' : phase.status}
                                </Badge>
                              </div>
                              <CardDescription>{phase.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                  <span>Прогресс</span>
                                  <span>{phase.completion}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${phase.completion}%` }}
                                  ></div>
                                </div>
                                <div className="mt-3">
                                  <p className="text-sm font-medium mb-2">Ключевые функции:</p>
                                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    {phase.features?.map((feature, index) => (
                                      <li key={index} className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                                        {feature}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                      
                      {roadmapData.key_metrics && (
                        <Card className="bg-blue-50 dark:bg-blue-900/20">
                          <CardHeader>
                            <CardTitle className="text-lg">Ключевые метрики</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                              <div>
                                <p className="font-medium">Целевая аудитория:</p>
                                <p className="text-gray-600 dark:text-gray-300">{roadmapData.key_metrics.target_users}</p>
                              </div>
                              <div>
                                <p className="font-medium">Цель точности:</p>
                                <p className="text-gray-600 dark:text-gray-300">{roadmapData.key_metrics.accuracy_goal}</p>
                              </div>
                              <div>
                                <p className="font-medium">Время ответа:</p>
                                <p className="text-gray-600 dark:text-gray-300">{roadmapData.key_metrics.response_time}</p>
                              </div>
                              <div>
                                <p className="font-medium">Доступность:</p>
                                <p className="text-gray-600 dark:text-gray-300">{roadmapData.key_metrics.availability}</p>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="stories">
              <Card>
                <CardHeader>
                  <CardTitle>User Stories</CardTitle>
                  <CardDescription>
                    Пользовательские истории и требования
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!userStoriesData && !tabLoading.userStories && !tabErrors.userStories && (
                    <div className="text-center">
                      <Button onClick={loadUserStories} variant="outline">
                        Загрузить пользовательские истории
                      </Button>
                    </div>
                  )}
                  
                  {tabLoading.userStories && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-orange-500"></div>
                      Загрузка пользовательских историй...
                    </div>
                  )}
                  
                  {tabErrors.userStories && (
                    <div className="text-red-600 dark:text-red-400">
                      {tabErrors.userStories}
                      <Button onClick={loadUserStories} variant="outline" size="sm" className="ml-2">
                        Повторить
                      </Button>
                    </div>
                  )}
                  
                  {userStoriesData && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">{userStoriesData.title}</h3>
                      <div className="grid gap-4">
                        {userStoriesData.stories?.map((story) => (
                          <Card key={story.id} className="border">
                            <CardHeader className="pb-3">
                              <div className="flex items-center justify-between">
                                <CardTitle className="text-lg">{story.title}</CardTitle>
                                <Badge variant={story.priority === 'high' ? 'destructive' : story.priority === 'medium' ? 'default' : 'secondary'}>
                                  {story.priority === 'high' ? 'Высокий' : 
                                   story.priority === 'medium' ? 'Средний' : 
                                   story.priority === 'low' ? 'Низкий' : story.priority}
                                </Badge>
                              </div>
                              <CardDescription>{story.description}</CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-3">
                                <div>
                                  <p className="text-sm font-medium mb-2">Пользователь:</p>
                                  <p className="text-sm text-gray-600 dark:text-gray-300">{story.user_type}</p>
                                </div>
                                <div>
                                  <p className="text-sm font-medium mb-2">Критерии приемки:</p>
                                  <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                    {story.acceptance_criteria?.map((criteria, index) => (
                                      <li key={index} className="flex items-start gap-2">
                                        <div className="w-1.5 h-1.5 bg-orange-500 rounded-full mt-2"></div>
                                        {criteria}
                                      </li>
                                    ))}
                                  </ul>
                                </div>
                                {story.business_value && (
                                  <div>
                                    <p className="text-sm font-medium mb-2">Бизнес-ценность:</p>
                                    <p className="text-sm text-gray-600 dark:text-gray-300">{story.business_value}</p>
                                  </div>
                                )}
                              </div>
                            </CardContent>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="architecture">
              <Card>
                <CardHeader>
                  <CardTitle>Архитектура системы</CardTitle>
                  <CardDescription>
                    Техническая архитектура Advisor AGI
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!architectureData && !tabLoading.architecture && !tabErrors.architecture && (
                    <div className="text-center">
                      <Button onClick={loadArchitecture} variant="outline">
                        Загрузить информацию об архитектуре
                      </Button>
                    </div>
                  )}
                  
                  {tabLoading.architecture && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-purple-500"></div>
                      Загрузка информации об архитектуре...
                    </div>
                  )}
                  
                  {tabErrors.architecture && (
                    <div className="text-red-600 dark:text-red-400">
                      {tabErrors.architecture}
                      <Button onClick={loadArchitecture} variant="outline" size="sm" className="ml-2">
                        Повторить
                      </Button>
                    </div>
                  )}
                  
                  {architectureData && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">{architectureData.title}</h3>
                      
                      {architectureData.overview && (
                        <Card className="bg-purple-50 dark:bg-purple-900/20">
                          <CardHeader>
                            <CardTitle className="text-lg">Обзор архитектуры</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{architectureData.overview}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {architectureData.components && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Компоненты системы</h4>
                          <div className="grid gap-4">
                            {architectureData.components.map((component) => (
                              <Card key={component.name} className="border">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">{component.name}</CardTitle>
                                  <CardDescription>{component.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  <div className="space-y-3">
                                    <div>
                                      <p className="text-sm font-medium mb-2">Технологии:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {component.technologies?.map((tech, index) => (
                                          <Badge key={index} variant="outline">{tech}</Badge>
                                        ))}
                                      </div>
                                    </div>
                                    {component.responsibilities && (
                                      <div>
                                        <p className="text-sm font-medium mb-2">Ответственности:</p>
                                        <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                          {component.responsibilities.map((resp, index) => (
                                            <li key={index} className="flex items-start gap-2">
                                              <div className="w-1.5 h-1.5 bg-purple-500 rounded-full mt-2"></div>
                                              {resp}
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {architectureData.data_flow && (
                        <Card className="border">
                          <CardHeader>
                            <CardTitle className="text-lg">Поток данных</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <ol className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
                              {architectureData.data_flow.map((step, index) => (
                                <li key={index} className="flex items-start gap-3">
                                  <div className="flex-shrink-0 w-6 h-6 bg-purple-500 text-white rounded-full flex items-center justify-center text-xs font-medium">
                                    {index + 1}
                                  </div>
                                  {step}
                                </li>
                              ))}
                            </ol>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="legal">
              <Card>
                <CardHeader>
                  <CardTitle>Юридическая информация</CardTitle>
                  <CardDescription>
                    Правовые аспекты и соответствие требованиям
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {!legalData && !tabLoading.legal && !tabErrors.legal && (
                    <div className="text-center">
                      <Button onClick={loadLegal} variant="outline">
                        Загрузить юридическую информацию
                      </Button>
                    </div>
                  )}
                  
                  {tabLoading.legal && (
                    <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-teal-500"></div>
                      Загрузка юридической информации...
                    </div>
                  )}
                  
                  {tabErrors.legal && (
                    <div className="text-red-600 dark:text-red-400">
                      {tabErrors.legal}
                      <Button onClick={loadLegal} variant="outline" size="sm" className="ml-2">
                        Повторить
                      </Button>
                    </div>
                  )}
                  
                  {legalData && (
                    <div className="space-y-6">
                      <h3 className="text-xl font-semibold">{legalData.title}</h3>
                      
                      {legalData.overview && (
                        <Card className="bg-teal-50 dark:bg-teal-900/20">
                          <CardHeader>
                            <CardTitle className="text-lg">Обзор</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{legalData.overview}</p>
                          </CardContent>
                        </Card>
                      )}
                      
                      {legalData.compliance && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Соответствие требованиям</h4>
                          <div className="grid gap-4">
                            {legalData.compliance.map((item) => (
                              <Card key={item.regulation} className="border">
                                <CardHeader className="pb-3">
                                  <div className="flex items-center justify-between">
                                    <CardTitle className="text-lg">{item.regulation}</CardTitle>
                                    <Badge variant={item.status === 'compliant' ? 'default' : item.status === 'in_progress' ? 'secondary' : 'outline'}>
                                      {item.status === 'compliant' ? 'Соответствует' : 
                                       item.status === 'in_progress' ? 'В процессе' : 
                                       item.status === 'planned' ? 'Запланировано' : item.status}
                                    </Badge>
                                  </div>
                                  <CardDescription>{item.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {item.measures && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Принятые меры:</p>
                                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        {item.measures.map((measure, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                                            {measure}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {legalData.policies && (
                        <div>
                          <h4 className="text-lg font-semibold mb-4">Политики и процедуры</h4>
                          <div className="grid gap-4">
                            {legalData.policies.map((policy) => (
                              <Card key={policy.name} className="border">
                                <CardHeader className="pb-3">
                                  <CardTitle className="text-lg">{policy.name}</CardTitle>
                                  <CardDescription>{policy.description}</CardDescription>
                                </CardHeader>
                                <CardContent>
                                  {policy.key_points && (
                                    <div>
                                      <p className="text-sm font-medium mb-2">Ключевые моменты:</p>
                                      <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                                        {policy.key_points.map((point, index) => (
                                          <li key={index} className="flex items-start gap-2">
                                            <div className="w-1.5 h-1.5 bg-teal-500 rounded-full mt-2"></div>
                                            {point}
                                          </li>
                                        ))}
                                      </ul>
                                    </div>
                                  )}
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {legalData.contact && (
                        <Card className="bg-gray-50 dark:bg-gray-800">
                          <CardHeader>
                            <CardTitle className="text-lg">Контактная информация</CardTitle>
                          </CardHeader>
                          <CardContent>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              <p><strong>Email:</strong> {legalData.contact.email}</p>
                              <p><strong>Адрес:</strong> {legalData.contact.address}</p>
                              <p><strong>Последнее обновление:</strong> {legalData.contact.last_updated}</p>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </Router>
  )
}

export default App

