import { useBooking as useNdBooking } from '@/nd'

// Novo Dash kit: the page's buttons keep calling useBooking().openModal; the
// funnel itself (modal, /book, webhooks, tracking) lives in src/nd.
export function useBooking() {
  const booking = useNdBooking()
  return { isOpen: booking.isOpen, openModal: () => booking.open(), closeModal: booking.close }
}
