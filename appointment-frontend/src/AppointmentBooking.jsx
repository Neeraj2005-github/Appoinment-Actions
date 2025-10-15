import React, { Component } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { FaRegClock } from "react-icons/fa";
import "./AppointmentBooking.css";

const BASEURL = `${import.meta.env.VITE_API_URL}/`;

// Fetch doctors
async function fetchDoctors(callback) {
  try {
    const res = await fetch(`${BASEURL}doctors/list`);
    if (!res.ok) throw new Error(`${res.status}::${res.statusText}`);
    const data = await res.json();
    callback({ status: "success", data });
  } catch (err) {
    callback({ status: "error", message: err.message });
  }
}

// Book appointment
async function bookAppointment(appointmentData, callback) {
  try {
    const res = await fetch(`${BASEURL}appointments/create`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(appointmentData),
    });
    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      data = { status: "success", message: text };
    }
    callback(data);
  } catch (err) {
    callback({ status: "error", message: err.message });
  }
}

// Custom time input for DatePicker
const CustomTimeInput = React.forwardRef(({ value, onClick }, ref) => (
  <button
    type="button"
    className="custom-time-input"
    onClick={onClick}
    ref={ref}
    style={{
      display: "flex",
      alignItems: "center",
      width: "100%",
      background: "white",
      border: "1px solid #b3c6e0",
      borderRadius: 6,
      padding: "10px 12px",
      color: "#111",
      fontSize: "1rem",
    }}
  >
    <FaRegClock style={{ marginRight: 8 }} />
    {value || "Select time"}
  </button>
));

class BookAppointment extends Component {
  state = {
    fullName: "",
    phone: "",
    department: "",
    doctors: [],
    selectedDoctor: null,
    appointmentDate: null,
    appointmentTime: null,
    loading: false,
    error: null,
    success: null,
  };

  componentDidMount() {
    fetchDoctors((res) => {
      if (res.status === "success") this.setState({ doctors: res.data });
      else this.setState({ error: res.message });
    });
  }

 getAvailableDoctors = (department) => {
  return this.state.doctors.filter(
    (doc) =>
      doc.department?.trim().toLowerCase() === department.trim().toLowerCase() &&
      doc.status?.toLowerCase() === "available"
  );
};


 handleChange = (e) => {
  const { name, value } = e.target;
  if (name === "department") {
    this.setState({ department: value, selectedDoctor: null, error: null });
    fetch(`${BASEURL}doctors/department/${value}`)
      .then(res => res.json())
      .then(data => {
        if (data.length > 0) {
          this.setState({ selectedDoctor: data[0], error: null });
        } else {
          this.setState({ error: "No doctor available in this department." });
        }
      })
      .catch(err => this.setState({ error: err.message }));
  } else {
    this.setState({ [name]: value });
  }
};


  handleDateChange = (date) => this.setState({ appointmentDate: date });
  handleTimeChange = (time) => this.setState({ appointmentTime: time });

  validateForm = () => {
    const { fullName, phone, appointmentDate, appointmentTime, department } =
      this.state;
    if (!fullName || !phone || !appointmentDate || !appointmentTime || !department)
      return "Please fill in all required fields.";
    if (!/^\d{10}$/.test(phone)) return "Phone must be 10 digits.";
    return null;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    const error = this.validateForm();
    if (error) return this.setState({ error });

    const {
      fullName,
      phone,
      appointmentDate,
      appointmentTime,
      department,
      selectedDoctor,
    } = this.state;

    if (!selectedDoctor)
      return this.setState({
        error: "No doctor available for this department.",
      });

    const formattedDate = appointmentDate.toISOString().split("T")[0];
    const formattedTime =
      appointmentTime instanceof Date
        ? appointmentTime.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })
        : appointmentTime;

    const appointmentData = {
      fullName: fullName.trim(),
      phone: phone.trim(),
      department,
      appointmentDate: formattedDate,
      appointmentTime: formattedTime,
      status: "Scheduled",
      doctor: { id: selectedDoctor.id },
    };

    this.setState({ loading: true, error: null });

    bookAppointment(appointmentData, (response) => {
      this.setState({ loading: false });
      if (response.status === "success") {
        this.setState({
          success: response.message || "Appointment booked successfully!",
          fullName: "",
          phone: "",
          department: "",
          selectedDoctor: null,
          appointmentDate: null,
          appointmentTime: null,
        });
        setTimeout(() => this.setState({ success: null }), 2000);
      } else {
        this.setState({
          error: response.message || "Failed to book appointment.",
        });
      }
    });
  };

  render() {
    const {
      fullName,
      phone,
      department,
      selectedDoctor,
      appointmentDate,
      appointmentTime,
      loading,
      error,
      success,
    } = this.state;

    return (
      <div className="appointment-container">
        <form className="appointment-form" onSubmit={this.handleSubmit}>
          <h2>Book Appointment</h2>

          {error && <div className="error-message">{error}</div>}
          {success && (
            <div className="success-message">{typeof success === 'string' ? success : 'Appointment booked successfully!'}</div>
          )}

          <div className="form-group">
            <label>Full Name *</label>
            <input
              type="text"
              name="fullName"
              value={fullName}
              onChange={this.handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label>Phone *</label>
            <input
              type="tel"
              name="phone"
              value={phone}
              onChange={this.handleChange}
              pattern="[0-9]{10}"
              required
            />
          </div>

          <div className="form-group">
            <label>Department *</label>
            <select
              name="department"
              value={department}
              onChange={this.handleChange}
              required
            >
              <option value="">-- Select --</option>
              <option value="General Medicine">General Medicine</option>
              <option value="Cardiology">Cardiology</option>
              <option value="Dermatology">Dermatology</option>
              <option value="Orthopedics">Orthopedics</option>
              <option value="Pediatrics">Pediatrics</option>
            </select>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Date *</label>
              <DatePicker
                selected={appointmentDate}
                onChange={this.handleDateChange}
                minDate={new Date()}
                dateFormat="yyyy-MM-dd"
                placeholderText="Select date"
                required
              />
            </div>
            <div className="form-group">
              <label>Time *</label>
              <DatePicker
                selected={appointmentTime}
                onChange={this.handleTimeChange}
                showTimeSelect
                showTimeSelectOnly
                timeIntervals={15}
                timeCaption="Time"
                dateFormat="HH:mm"
                placeholderText="Select time"
                required
                customInput={<CustomTimeInput />}
              />
            </div>
          </div>

          {selectedDoctor && (
            <div className="doctor-info">
              Assigned Doctor: Dr. {selectedDoctor.fullName || selectedDoctor.name} (
              {selectedDoctor.department})
            </div>
          )}

          <button
            type="submit"
            className="submit-button"
            disabled={loading || !selectedDoctor}
          >
            {loading ? "Booking..." : "Book Appointment"}
          </button>
        </form>
      </div>
    );
  }
}

export default BookAppointment;
