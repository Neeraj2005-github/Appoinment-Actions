import React, { Component } from "react";
import "./AppointmentBooking.css";

const BASEURL = `${import.meta.env.VITE_API_URL}/`;

// Fetch all appointments
async function fetchAppointments(callback) {
  try {
    const res = await fetch(`${BASEURL}appointments/list`);
    if (!res.ok) throw new Error(`${res.status}::${res.statusText}`);
    const data = await res.json();
    callback({ status: "success", data });
  } catch (err) {
    callback({ status: "error", message: err.message });
  }
}

// Delete appointment
async function deleteAppointment(id, callback) {
  try {
    const res = await fetch(`${BASEURL}appointments/${id}`, { method: "DELETE" });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { status: "success", message: text }; }
    callback(data);
  } catch (err) {
    callback({ status: "error", message: err.message });
  }
}

async function updateAppointment(id, payload, callback) {
  try {
    const res = await fetch(`${BASEURL}appointments/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    let data;
    try { data = JSON.parse(text); } catch { data = { status: "success", message: text }; }
    callback(data);
  } catch (err) {
    callback({ status: "error", message: err.message });
  }
}

class MyAppointments extends Component {
  state = { appointments: [], loading: true, error: null, success: null, editing: null, editForm: {} };

  componentDidMount() {
    fetchAppointments((res) => {
      if (res.status === "success") this.setState({ appointments: res.data, loading: false });
      else this.setState({ error: res.message, loading: false });
    });
  }

  handleDelete = (id) => {
    if (!window.confirm("Are you sure you want to remove this appointment?")) return;
    deleteAppointment(id, (res) => {
      if (res.status === "success") {
        this.setState((prev) => ({
          appointments: prev.appointments.filter((appt) => appt.id !== id),
          error: null,
          success: res.message || "Appointment deleted successfully.",
        }));
        setTimeout(() => this.setState({ success: null }), 2000);
      } else this.setState({ error: res.message });
    });
  };

  startEdit = (appt) => {
    this.setState({ editing: appt.id, editForm: {
      fullName: appt.fullName || "",
      phone: appt.phone || "",
      department: appt.department || "",
      appointmentDate: appt.appointmentDate || "",
      appointmentTime: appt.appointmentTime || "",
      status: appt.status || "Scheduled",
      doctor: appt.doctor ? { id: appt.doctor.id } : null,
    }});
  };

  cancelEdit = () => this.setState({ editing: null, editForm: {} });

  onEditChange = (e) => {
    const { name, value } = e.target;
    this.setState((prev) => ({ editForm: { ...prev.editForm, [name]: value } }));
  };

  saveEdit = (id) => {
    const payload = this.state.editForm;
    updateAppointment(id, payload, (res) => {
      if (res.status === "success") {
        this.setState((prev) => ({
          appointments: prev.appointments.map((a) => a.id === id ? { ...a, ...payload } : a),
          editing: null,
          error: null,
          success: res.message || "Appointment updated successfully.",
        }));
        setTimeout(() => this.setState({ success: null }), 2000);
      } else {
        this.setState({ error: res.message || "Update failed" });
      }
    });
  };

  render() {
    const { appointments, loading, error, success, editing, editForm } = this.state;
    if (loading) return <div className="appointment-container"><p>Loading...</p></div>;
    if (error) return <div className="appointment-container"><div className="error-message">{error}</div></div>;

    return (
      <div className="appointment-container">
        <div className="appointment-form">
          <h2>My Appointments</h2>
          {success && <div className="success-message">{success}</div>}
          {appointments.length === 0 ? (
            <p>No appointments found.</p>
          ) : (
            <ul className="appointment-list">
              {appointments.map((appt) => (
                <li key={appt.id} className="appointment-item">
                  {editing === appt.id ? (
                    <div className="edit-form">
                      <div style={{ display: 'grid', gap: 8 }}>
                        <input name="fullName" value={editForm.fullName || ""} onChange={this.onEditChange} placeholder="Full Name" />
                        <input name="phone" value={editForm.phone || ""} onChange={this.onEditChange} placeholder="Phone" />
                        <input name="department" value={editForm.department || ""} onChange={this.onEditChange} placeholder="Department" />
                        <input name="appointmentDate" value={editForm.appointmentDate || ""} onChange={this.onEditChange} placeholder="YYYY-MM-DD" />
                        <input name="appointmentTime" value={editForm.appointmentTime || ""} onChange={this.onEditChange} placeholder="HH:mm" />
                        <select name="status" value={editForm.status || "Scheduled"} onChange={this.onEditChange}>
                          <option value="Scheduled">Scheduled</option>
                          <option value="Completed">Completed</option>
                          <option value="Cancelled">Cancelled</option>
                        </select>
                      </div>
                      <div style={{ marginTop: 8 }}>
                        <button onClick={() => this.saveEdit(appt.id)} className="submit-button">Save</button>
                        <button onClick={this.cancelEdit} className="remove-appointment-btn" style={{ marginLeft: 8 }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <strong>{appt.fullName}</strong> - {appt.department}<br/>
                      Date: {appt.appointmentDate}, Time: {appt.appointmentTime}<br/>
                      Doctor: {appt.doctor?.fullName || "N/A"}
                      <div className="appointment-actions">
                        <button
                          className="submit-button"
                          onClick={() => this.startEdit(appt)}
                        >
                          Edit
                        </button>
                        <button
                          className="remove-appointment-btn"
                          onClick={() => this.handleDelete(appt.id)}
                          style={{ background: '#e53935', color: '#fff', border: 'none' }}
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    );
  }
}

export default MyAppointments;
