import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private readonly apiUrl = 'https://gamehub-api-lvep.onrender.com/api';

  constructor(private http: HttpClient) { }

  login(credentials: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  getClients(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients`);
  }

  getClientById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/clients/${id}`);
  }

  createClient(clientData: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients`, clientData);
  }

  updateClient(id: number, clientData: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/clients/${id}`, clientData);
  }

  deleteClient(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/clients/${id}`);
  }

  getActiveSessions(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/active`);
  }

  checkIn(clientId: number, stationId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/check-in`, {
      client_id: clientId,
      station_id: stationId
    });
  }

  checkOut(clientId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/sessions/check-out`, { client_id: clientId });
  }

  getClientSessionHistory(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/sessions/client/${clientId}`);
  }

  // --- Settings ---
  getSettings(): Observable<any> {
    return this.http.get(`${this.apiUrl}/settings`);
  }
  updateSettings(settings: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/settings`, settings);
  }

  // --- Transactions ---
  getTransactionHistory(clientId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/clients/${clientId}/transactions`);
  }
  addHoursTransaction(clientId: number, data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/add-hours-transaction`, data);
  }

  upgradeToClub(clientId: number, data: { next_billing_date: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clients/${clientId}/upgrade-to-club`, data);
  }

  renewSubscription(clientId: number, data: { new_next_billing_date: string }): Observable<any> {
    return this.http.patch(`${this.apiUrl}/clients/${clientId}/renew-subscription`, data);
  }

  // --- Stations ---
  getStations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stations`);
  }

  createStation(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/stations`, data);
  }

  updateStation(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/stations/${id}`, data);
  }

  deleteStation(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/stations/${id}`);
  }

  // --- Bookings ---
  getBookingsByDate(date: string): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/bookings`, { params: { date } });
  }
  createBooking(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/bookings`, data);
  }
  deleteBooking(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/bookings/${id}`);
  }

  // --- Packages ---
  getActivePackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/packages`);
  }
  buyPackageForClient(clientId: number, data: { package_id: number; payment_method: string }): Observable<any> {
    return this.http.post(`${this.apiUrl}/clients/${clientId}/buy-package`, data);
  }

  getAllPackages(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/packages/all`);
  }
  createPackage(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/packages`, data);
  }
  updatePackage(id: number, data: any): Observable<any> {
    return this.http.put(`${this.apiUrl}/packages/${id}`, data);
  }
  deletePackage(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/packages/${id}`);
  }

  // --- Reports ---
  getDashboardSummary(): Observable<any> {
    return this.http.get(`${this.apiUrl}/reports/dashboard-summary`);
  }

  getPeakHours(): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/reports/peak-hours`);
  }

  getFinancialReport(startDate: string, endDate: string): Observable<any> {
    const params = { startDate, endDate };
    return this.http.get(`${this.apiUrl}/reports/financial-details`, { params });
  }

  // --- Cash Flow ---
  getTodayCashFlow(): Observable<any> {
    return this.http.get(`${this.apiUrl}/cash-flow/today`);
  }

  openCashFlow(data: { opening_balance: number }): Observable<any> {
    return this.http.post(`${this.apiUrl}/cash-flow/open`, data);
  }

  closeCashFlow(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/cash-flow/close`, data);
  }
}
