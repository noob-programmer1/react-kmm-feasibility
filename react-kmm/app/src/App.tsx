import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import PlanSelectionScreen from './screens/PlanSelectionScreen'
import PassSetupScreen from './screens/PassSetupScreen'
import CalendarScreen from './screens/CalendarScreen'
import CheckoutScreen from './screens/CheckoutScreen'
import MySubscriptionScreen from './screens/MySubscriptionScreen'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/plans" replace />} />
        <Route path="/plans" element={<PlanSelectionScreen />} />
        <Route path="/pass-setup" element={<PassSetupScreen />} />
        <Route path="/calendar" element={<CalendarScreen />} />
        <Route path="/checkout" element={<CheckoutScreen />} />
        <Route path="/subscription" element={<MySubscriptionScreen />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
