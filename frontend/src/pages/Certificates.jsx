import { useState, useEffect } from "react";
import { jsPDF } from "jspdf";
import "../styles/Certificates.css";
import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";
import Footer from "../components/Footer";
import { authFetch } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useEnrolledCourses } from "../hooks/useCourses";

function Certificates() {
  const { user } = useAuth();
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const { enrolledCourses } = useEnrolledCourses();

  useEffect(() => {
    authFetch("/courses/certificates")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch certificates");
        return res.json();
      })
      .then((data) => {
        setCertificates(data);
      })
      .catch((err) => {
        console.error(err);
        setError("Error loading certificates.");
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const totalEnrolled = enrolledCourses ? enrolledCourses.length : 0;
  const earnedCount = certificates.length;
  const pct = totalEnrolled > 0 ? Math.min(100, Math.round((earnedCount / totalEnrolled) * 100)) : 0;
  const angle = (pct / 100) * 360;

  const handleDownload = (cert) => {
    if (!user) return;
    
    // Create new PDF Document in landscape mode
    const doc = new jsPDF({
      orientation: "landscape",
      unit: "px",
      format: [800, 600]
    });

    // Dark cyber themes matching the LMS
    doc.setFillColor(10, 15, 29); // #0a0f1d
    doc.rect(0, 0, 800, 600, "F");

    // Inner gold border
    doc.setDrawColor(196, 138, 82); // #C48A52
    doc.setLineWidth(4);
    doc.rect(20, 20, 760, 560);

    // Subtle blue background border
    doc.setDrawColor(26, 38, 63); // #1a263f
    doc.setLineWidth(1);
    doc.rect(30, 30, 740, 540);

    // Decorative corner markings
    doc.setDrawColor(196, 138, 82);
    doc.setLineWidth(2);
    // Top-Left corner lines
    doc.line(40, 40, 70, 40);
    doc.line(40, 40, 40, 70);
    // Top-Right corner lines
    doc.line(760, 40, 730, 40);
    doc.line(760, 40, 760, 70);
    // Bottom-Left corner lines
    doc.line(40, 560, 70, 560);
    doc.line(40, 560, 40, 530);
    // Bottom-Right corner lines
    doc.line(760, 560, 730, 560);
    doc.line(760, 560, 760, 530);

    // Certificate Title
    doc.setTextColor(196, 138, 82);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(36);
    doc.text("CERTIFICATE OF COMPLETION", 400, 120, { align: "center" });

    // Subtitle
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(16);
    doc.text("THIS IS PROUDLY PRESENTED TO", 400, 180, { align: "center" });

    // Student Name
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(28);
    const studentName = user.name || user.email.split("@")[0];
    doc.text(studentName.toUpperCase(), 400, 225, { align: "center" });

    // Divider Line
    doc.setDrawColor(196, 138, 82);
    doc.setLineWidth(2);
    doc.line(220, 250, 580, 250);

    // Description text
    doc.setTextColor(136, 146, 176); // #8892b0
    doc.setFont("helvetica", "normal");
    doc.setFontSize(14);
    doc.text("for outstanding dedication and successful completion of the training curriculum", 400, 290, { align: "center" });

    // Course Title
    doc.setTextColor(196, 138, 82);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24);
    const courseTitle = cert.course ? cert.course.title : "Cyber Course";
    doc.text(courseTitle.toUpperCase(), 400, 335, { align: "center" });

    // Issued Date
    doc.setTextColor(136, 146, 176);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(13);
    const issuedDate = new Date(cert.issuedAt).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
    });
    doc.text(`Issued on: ${issuedDate}`, 400, 385, { align: "center" });

    // Signatures / Authority
    doc.text("Authorized by: Shourya Cyber Academy", 400, 420, { align: "center" });

    // Verification Footer
    doc.setTextColor(74, 85, 104); // subtle grey
    doc.setFontSize(9);
    doc.text(`Verification ID: SEC-LMS-${cert.id}-${cert.courseId}-${cert.userId}`, 400, 510, { align: "center" });
    doc.text("Securely verified by Antigravity Cyber Security Engine", 400, 525, { align: "center" });

    // Save File
    doc.save(`LMS_Certificate_${courseTitle.replace(/\s+/g, "_")}.pdf`);
  };

  return (
    <div className="student-dashboard">
      <Sidebar />

      <div className="main-content">
        <Topbar />

        <div className="certificates-header">
          <div>
            <span className="certificate-tag">
              ACHIEVEMENTS & RECOGNITION
            </span>
            <h1 className="page-title">
              My Certificates
            </h1>
            <p className="page-subtitle">
              Showcase your achievements and completed courses.
            </p>
          </div>

          <div
            className="certificate-count"
            style={{
              background: `radial-gradient(circle, #121826 58%, transparent 59%), conic-gradient(#00F5FF 0deg ${angle}deg, #2A2A35 ${angle}deg 360deg)`
            }}
          >
            <h2>{earnedCount.toString().padStart(2, "0")}</h2>
            <span>Certificates Earned</span>
          </div>
        </div>

        {loading ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
            <h3>Loading certificates...</h3>
          </div>
        ) : error ? (
          <div style={{ color: "#f87171", textAlign: "center", padding: "40px" }}>
            <h3>{error}</h3>
          </div>
        ) : certificates.length === 0 ? (
          <div style={{ color: "var(--text-secondary)", textAlign: "center", padding: "40px" }}>
            <h3>You have not earned any certificates yet.</h3>
            <p style={{ marginTop: "10px" }}>Complete all modules in an enrolled course to receive a certificate!</p>
          </div>
        ) : (
          <div className="certificate-grid">
            {certificates.map((cert) => (
              <div className="certificate-card" key={cert.id}>
                <div className="certificate-badge">
                  🏆
                </div>
                <h2>{cert.course ? cert.course.title : "Cyber Course"}</h2>
                <p>
                  Successfully completed the course modules and assessments.
                </p>
                <span className="issue-date">
                  Issued: {new Date(cert.issuedAt).toLocaleDateString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric"
                  })}
                </span>
                <button onClick={() => handleDownload(cert)}>
                  Download Certificate
                </button>
              </div>
            ))}
          </div>
        )}

        <Footer />
      </div>
    </div>
  );
}

export default Certificates;