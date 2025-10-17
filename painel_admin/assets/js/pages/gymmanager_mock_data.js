window.mockData = {
  "students": [
    {
      "id": 1,
      "name": "Maria Silva",
      "email": "maria@example.com",
      "phone": "11999990001",
      "status": "active",
      "planType": "mensal",
      "monthlyFee": 120.0,
      "joinDate": "2025-06-10",
      "lastCheckin": "2025-08-14"
    },
    {
      "id": 2,
      "name": "João Pereira",
      "email": "joao@example.com",
      "phone": "11999990002",
      "status": "active",
      "planType": "mensal",
      "monthlyFee": 150.0,
      "joinDate": "2025-07-01",
      "lastCheckin": "2025-08-15"
    },
    {
      "id": 3,
      "name": "Ana Souza",
      "email": "ana@example.com",
      "phone": "11999990003",
      "status": "inactive",
      "planType": "anual",
      "monthlyFee": 0,
      "joinDate": "2024-12-05",
      "lastCheckin": "2025-05-02"
    }
  ],
  "payments": [
    {
      "id": 1,
      "studentId": 1,
      "amount": 120.0,
      "date": "2025-08-01",
      "status": "paid"
    },
    {
      "id": 2,
      "studentId": 2,
      "amount": 150.0,
      "date": "2025-08-05",
      "status": "paid"
    },
    {
      "id": 3,
      "studentId": 3,
      "amount": 120.0,
      "date": "2025-07-01",
      "status": "overdue"
    }
  ],
  "checkins": [
    {
      "id": 1,
      "studentId": 1,
      "datetime": "2025-08-14T09:20:00"
    },
    {
      "id": 2,
      "studentId": 2,
      "datetime": "2025-08-15T08:05:00"
    }
  ],
  "classes": []
};
