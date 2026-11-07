import { useState } from 'react';

export default function useTickets() {
  const [tickets, setTickets] = useState([]);
  return { tickets, setTickets };
}
