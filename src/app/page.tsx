"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, Area, AreaChart
} from 'recharts'
import { 
  Wallet, TrendingUp, TrendingDown, Target, Plus, Minus, 
  CreditCard, ShoppingCart, Home, Car, Utensils, Gamepad2,
  Calendar, Filter, Search, Eye, EyeOff, Settings
} from 'lucide-react'

interface Transaction {
  id: string
  type: 'income' | 'expense'
  amount: number
  category: string
  description: string
  date: string
}

interface Goal {
  id: string
  name: string
  target: number
  current: number
  category: string
  deadline: string
}

const categories = {
  income: ['Salário', 'Freelance', 'Investimentos', 'Outros'],
  expense: ['Alimentação', 'Transporte', 'Moradia', 'Entretenimento', 'Saúde', 'Compras', 'Outros']
}

const categoryIcons = {
  'Alimentação': Utensils,
  'Transporte': Car,
  'Moradia': Home,
  'Entretenimento': Gamepad2,
  'Compras': ShoppingCart,
  'Salário': Wallet,
  'Freelance': TrendingUp,
  'Investimentos': Target
}

const COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#6366f1']

export default function FinancialApp() {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [goals, setGoals] = useState<Goal[]>([])
  const [isAddTransactionOpen, setIsAddTransactionOpen] = useState(false)
  const [isAddGoalOpen, setIsAddGoalOpen] = useState(false)
  const [balanceVisible, setBalanceVisible] = useState(true)
  const [activeTab, setActiveTab] = useState('dashboard')

  // Form states
  const [transactionForm, setTransactionForm] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  })

  const [goalForm, setGoalForm] = useState({
    name: '',
    target: '',
    category: '',
    deadline: ''
  })

  // Load data from localStorage
  useEffect(() => {
    const savedTransactions = localStorage.getItem('financial-transactions')
    const savedGoals = localStorage.getItem('financial-goals')
    
    if (savedTransactions) {
      setTransactions(JSON.parse(savedTransactions))
    }
    if (savedGoals) {
      setGoals(JSON.parse(savedGoals))
    }
  }, [])

  // Save to localStorage
  useEffect(() => {
    localStorage.setItem('financial-transactions', JSON.stringify(transactions))
  }, [transactions])

  useEffect(() => {
    localStorage.setItem('financial-goals', JSON.stringify(goals))
  }, [goals])

  // Calculations
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0)

  const totalExpenses = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0)

  const balance = totalIncome - totalExpenses

  // Category data for charts
  const expensesByCategory = categories.expense.map(category => {
    const amount = transactions
      .filter(t => t.type === 'expense' && t.category === category)
      .reduce((sum, t) => sum + t.amount, 0)
    return { name: category, value: amount }
  }).filter(item => item.value > 0)

  // Monthly data for trends
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const date = new Date()
    date.setMonth(date.getMonth() - i)
    const monthKey = date.toISOString().slice(0, 7)
    
    const monthIncome = transactions
      .filter(t => t.type === 'income' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0)
    
    const monthExpenses = transactions
      .filter(t => t.type === 'expense' && t.date.startsWith(monthKey))
      .reduce((sum, t) => sum + t.amount, 0)

    return {
      month: date.toLocaleDateString('pt-BR', { month: 'short' }),
      income: monthIncome,
      expenses: monthExpenses,
      balance: monthIncome - monthExpenses
    }
  }).reverse()

  const addTransaction = () => {
    if (!transactionForm.amount || !transactionForm.category) return

    const newTransaction: Transaction = {
      id: Date.now().toString(),
      type: transactionForm.type,
      amount: parseFloat(transactionForm.amount),
      category: transactionForm.category,
      description: transactionForm.description,
      date: transactionForm.date
    }

    setTransactions([newTransaction, ...transactions])
    setTransactionForm({
      type: 'expense',
      amount: '',
      category: '',
      description: '',
      date: new Date().toISOString().split('T')[0]
    })
    setIsAddTransactionOpen(false)
  }

  const addGoal = () => {
    if (!goalForm.name || !goalForm.target) return

    const newGoal: Goal = {
      id: Date.now().toString(),
      name: goalForm.name,
      target: parseFloat(goalForm.target),
      current: 0,
      category: goalForm.category,
      deadline: goalForm.deadline
    }

    setGoals([...goals, newGoal])
    setGoalForm({ name: '', target: '', category: '', deadline: '' })
    setIsAddGoalOpen(false)
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(amount)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="border-b border-white/10 bg-black/20 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">FinanceApp</h1>
                <p className="text-sm text-gray-400">Controle Financeiro Inteligente</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setBalanceVisible(!balanceVisible)}
                className="text-gray-400 hover:text-white"
              >
                {balanceVisible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
              </Button>
              <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white">
                <Settings className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 bg-black/20 backdrop-blur-xl border border-white/10">
            <TabsTrigger value="dashboard" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              Dashboard
            </TabsTrigger>
            <TabsTrigger value="transactions" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              Transações
            </TabsTrigger>
            <TabsTrigger value="goals" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              Metas
            </TabsTrigger>
            <TabsTrigger value="analytics" className="data-[state=active]:bg-purple-500/20 data-[state=active]:text-purple-300">
              Análises
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            {/* Balance Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="bg-black/20 backdrop-blur-xl border-white/10 hover:border-purple-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Saldo Total</CardTitle>
                  <Wallet className="h-4 w-4 text-purple-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {balanceVisible ? formatCurrency(balance) : '••••••'}
                  </div>
                  <p className={`text-xs ${balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    {balance >= 0 ? '+' : ''}{((balance / (totalIncome || 1)) * 100).toFixed(1)}% do total
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-xl border-white/10 hover:border-green-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Receitas</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {balanceVisible ? formatCurrency(totalIncome) : '••••••'}
                  </div>
                  <p className="text-xs text-green-400">
                    +{transactions.filter(t => t.type === 'income').length} transações
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black/20 backdrop-blur-xl border-white/10 hover:border-red-500/50 transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-400">Despesas</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-white">
                    {balanceVisible ? formatCurrency(totalExpenses) : '••••••'}
                  </div>
                  <p className="text-xs text-red-400">
                    -{transactions.filter(t => t.type === 'expense').length} transações
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Expenses by Category */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Despesas por Categoria</CardTitle>
                  <CardDescription className="text-gray-400">
                    Distribuição dos seus gastos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={expensesByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {expensesByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Monthly Trend */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Tendência Mensal</CardTitle>
                  <CardDescription className="text-gray-400">
                    Receitas vs Despesas nos últimos 6 meses
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Area type="monotone" dataKey="income" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.3} />
                      <Area type="monotone" dataKey="expenses" stackId="2" stroke="#EF4444" fill="#EF4444" fillOpacity={0.3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Recent Transactions */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Transações Recentes</CardTitle>
                  <CardDescription className="text-gray-400">
                    Suas últimas movimentações financeiras
                  </CardDescription>
                </div>
                <Dialog open={isAddTransactionOpen} onOpenChange={setIsAddTransactionOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                      <Plus className="w-4 h-4 mr-2" />
                      Nova Transação
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Adicionar Transação</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Registre uma nova receita ou despesa
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <Label className="text-gray-300">Tipo</Label>
                          <Select value={transactionForm.type} onValueChange={(value: 'income' | 'expense') => 
                            setTransactionForm({...transactionForm, type: value, category: ''})
                          }>
                            <SelectTrigger className="bg-gray-800 border-gray-600">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-gray-800 border-gray-600">
                              <SelectItem value="income">Receita</SelectItem>
                              <SelectItem value="expense">Despesa</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-gray-300">Valor</Label>
                          <Input
                            type="number"
                            placeholder="0,00"
                            value={transactionForm.amount}
                            onChange={(e) => setTransactionForm({...transactionForm, amount: e.target.value})}
                            className="bg-gray-800 border-gray-600 text-white"
                          />
                        </div>
                      </div>
                      <div>
                        <Label className="text-gray-300">Categoria</Label>
                        <Select value={transactionForm.category} onValueChange={(value) => 
                          setTransactionForm({...transactionForm, category: value})
                        }>
                          <SelectTrigger className="bg-gray-800 border-gray-600">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            {categories[transactionForm.type].map(category => (
                              <SelectItem key={category} value={category}>{category}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Descrição</Label>
                        <Input
                          placeholder="Descrição da transação"
                          value={transactionForm.description}
                          onChange={(e) => setTransactionForm({...transactionForm, description: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Data</Label>
                        <Input
                          type="date"
                          value={transactionForm.date}
                          onChange={(e) => setTransactionForm({...transactionForm, date: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <Button onClick={addTransaction} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500">
                        Adicionar Transação
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.slice(0, 5).map((transaction) => {
                    const Icon = categoryIcons[transaction.category as keyof typeof categoryIcons] || CreditCard
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 rounded-lg bg-gray-800/50 hover:bg-gray-800/70 transition-colors">
                        <div className="flex items-center space-x-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <Icon className={`w-5 h-5 ${
                              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{transaction.description || transaction.category}</p>
                            <p className="text-gray-400 text-sm">{transaction.category}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-gray-400 text-sm">
                            {new Date(transaction.date).toLocaleDateString('pt-BR')}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {transactions.length === 0 && (
                    <div className="text-center py-8 text-gray-400">
                      <CreditCard className="w-12 h-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma transação registrada ainda</p>
                      <p className="text-sm">Adicione sua primeira transação para começar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
                  <div>
                    <CardTitle className="text-white">Todas as Transações</CardTitle>
                    <CardDescription className="text-gray-400">
                      Histórico completo de movimentações
                    </CardDescription>
                  </div>
                  <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar transações..."
                        className="pl-10 bg-gray-800/50 border-gray-600 text-white"
                      />
                    </div>
                    <Button variant="outline" className="border-gray-600 text-gray-300 hover:bg-gray-800">
                      <Filter className="w-4 h-4 mr-2" />
                      Filtros
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {transactions.map((transaction) => {
                    const Icon = categoryIcons[transaction.category as keyof typeof categoryIcons] || CreditCard
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/30 hover:bg-gray-800/50 transition-all duration-200">
                        <div className="flex items-center space-x-4">
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                            transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'
                          }`}>
                            <Icon className={`w-6 h-6 ${
                              transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                            }`} />
                          </div>
                          <div>
                            <p className="text-white font-medium">{transaction.description || transaction.category}</p>
                            <div className="flex items-center space-x-2 mt-1">
                              <Badge variant="secondary" className="bg-gray-700 text-gray-300">
                                {transaction.category}
                              </Badge>
                              <span className="text-gray-400 text-sm">
                                {new Date(transaction.date).toLocaleDateString('pt-BR')}
                              </span>
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`text-lg font-semibold ${
                            transaction.type === 'income' ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                          </p>
                          <p className="text-gray-400 text-sm capitalize">
                            {transaction.type === 'income' ? 'Receita' : 'Despesa'}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                  {transactions.length === 0 && (
                    <div className="text-center py-12 text-gray-400">
                      <CreditCard className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Nenhuma transação encontrada</p>
                      <p className="text-sm">Comece adicionando sua primeira transação</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Goals Tab */}
          <TabsContent value="goals" className="space-y-6">
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-white">Metas de Economia</CardTitle>
                  <CardDescription className="text-gray-400">
                    Defina e acompanhe seus objetivos financeiros
                  </CardDescription>
                </div>
                <Dialog open={isAddGoalOpen} onOpenChange={setIsAddGoalOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-gradient-to-r from-purple-500 to-cyan-500 hover:from-purple-600 hover:to-cyan-600">
                      <Target className="w-4 h-4 mr-2" />
                      Nova Meta
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-gray-900 border-gray-700">
                    <DialogHeader>
                      <DialogTitle className="text-white">Criar Meta de Economia</DialogTitle>
                      <DialogDescription className="text-gray-400">
                        Defina um objetivo financeiro para se manter motivado
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label className="text-gray-300">Nome da Meta</Label>
                        <Input
                          placeholder="Ex: Viagem para Europa"
                          value={goalForm.name}
                          onChange={(e) => setGoalForm({...goalForm, name: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Valor Objetivo</Label>
                        <Input
                          type="number"
                          placeholder="0,00"
                          value={goalForm.target}
                          onChange={(e) => setGoalForm({...goalForm, target: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <div>
                        <Label className="text-gray-300">Categoria</Label>
                        <Select value={goalForm.category} onValueChange={(value) => 
                          setGoalForm({...goalForm, category: value})
                        }>
                          <SelectTrigger className="bg-gray-800 border-gray-600">
                            <SelectValue placeholder="Selecione uma categoria" />
                          </SelectTrigger>
                          <SelectContent className="bg-gray-800 border-gray-600">
                            <SelectItem value="viagem">Viagem</SelectItem>
                            <SelectItem value="casa">Casa</SelectItem>
                            <SelectItem value="carro">Carro</SelectItem>
                            <SelectItem value="educacao">Educação</SelectItem>
                            <SelectItem value="emergencia">Emergência</SelectItem>
                            <SelectItem value="outros">Outros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label className="text-gray-300">Data Limite</Label>
                        <Input
                          type="date"
                          value={goalForm.deadline}
                          onChange={(e) => setGoalForm({...goalForm, deadline: e.target.value})}
                          className="bg-gray-800 border-gray-600 text-white"
                        />
                      </div>
                      <Button onClick={addGoal} className="w-full bg-gradient-to-r from-purple-500 to-cyan-500">
                        Criar Meta
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {goals.map((goal) => {
                    const progress = (goal.current / goal.target) * 100
                    const isCompleted = progress >= 100
                    const daysLeft = goal.deadline ? Math.ceil((new Date(goal.deadline).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)) : null
                    
                    return (
                      <Card key={goal.id} className="bg-gray-800/30 border-gray-700 hover:bg-gray-800/50 transition-all duration-300">
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-white text-lg">{goal.name}</CardTitle>
                            <Badge variant={isCompleted ? "default" : "secondary"} className={
                              isCompleted ? "bg-green-500 text-white" : "bg-gray-700 text-gray-300"
                            }>
                              {goal.category}
                            </Badge>
                          </div>
                          <CardDescription className="text-gray-400">
                            Meta: {formatCurrency(goal.target)}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <div className="flex justify-between text-sm mb-2">
                              <span className="text-gray-400">Progresso</span>
                              <span className="text-white font-medium">{progress.toFixed(1)}%</span>
                            </div>
                            <Progress value={progress} className="h-2" />
                          </div>
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-white font-semibold">{formatCurrency(goal.current)}</p>
                              <p className="text-gray-400 text-sm">Economizado</p>
                            </div>
                            <div className="text-right">
                              <p className="text-white font-semibold">{formatCurrency(goal.target - goal.current)}</p>
                              <p className="text-gray-400 text-sm">Restante</p>
                            </div>
                          </div>
                          {daysLeft !== null && (
                            <div className="text-center">
                              <p className={`text-sm ${daysLeft > 0 ? 'text-cyan-400' : 'text-red-400'}`}>
                                {daysLeft > 0 ? `${daysLeft} dias restantes` : 'Meta vencida'}
                              </p>
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    )
                  })}
                  {goals.length === 0 && (
                    <div className="col-span-full text-center py-12 text-gray-400">
                      <Target className="w-16 h-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg mb-2">Nenhuma meta definida</p>
                      <p className="text-sm">Crie sua primeira meta de economia para começar</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Analytics Tab */}
          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Monthly Comparison */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Comparação Mensal</CardTitle>
                  <CardDescription className="text-gray-400">
                    Receitas vs Despesas por mês
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Bar dataKey="income" fill="#10B981" name="Receitas" />
                      <Bar dataKey="expenses" fill="#EF4444" name="Despesas" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>

              {/* Balance Trend */}
              <Card className="bg-black/20 backdrop-blur-xl border-white/10">
                <CardHeader>
                  <CardTitle className="text-white">Evolução do Saldo</CardTitle>
                  <CardDescription className="text-gray-400">
                    Como seu saldo evoluiu ao longo do tempo
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={monthlyData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                      <XAxis dataKey="month" stroke="#9CA3AF" />
                      <YAxis stroke="#9CA3AF" />
                      <Tooltip 
                        formatter={(value) => formatCurrency(Number(value))}
                        contentStyle={{ 
                          backgroundColor: '#1F2937', 
                          border: '1px solid #374151',
                          borderRadius: '8px'
                        }}
                      />
                      <Line 
                        type="monotone" 
                        dataKey="balance" 
                        stroke="#8B5CF6" 
                        strokeWidth={3}
                        dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
                        name="Saldo"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>

            {/* Financial Summary */}
            <Card className="bg-black/20 backdrop-blur-xl border-white/10">
              <CardHeader>
                <CardTitle className="text-white">Resumo Financeiro</CardTitle>
                <CardDescription className="text-gray-400">
                  Estatísticas detalhadas das suas finanças
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="text-center p-4 rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-purple-400 mb-2">
                      {transactions.length}
                    </div>
                    <p className="text-gray-400 text-sm">Total de Transações</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-green-400 mb-2">
                      {transactions.filter(t => t.type === 'income').length}
                    </div>
                    <p className="text-gray-400 text-sm">Receitas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-red-400 mb-2">
                      {transactions.filter(t => t.type === 'expense').length}
                    </div>
                    <p className="text-gray-400 text-sm">Despesas</p>
                  </div>
                  <div className="text-center p-4 rounded-lg bg-gray-800/30">
                    <div className="text-2xl font-bold text-cyan-400 mb-2">
                      {goals.length}
                    </div>
                    <p className="text-gray-400 text-sm">Metas Ativas</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}