import React, { useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiDownload, FiFileText, FiPrinter } from 'react-icons/fi';
import './PaySlip.css';

const PaySlip = ({ employee, onClose }) => {
  const pdfRef = useRef();

  // Mock Salary Calculation Logic
  const baseSalary = 45000;
  const allowance = 5500;
  const tax = (baseSalary + allowance) * 0.10; // 10% Tax
  const pf = 1800; // Provident Fund
  const netSalary = (baseSalary + allowance) - (tax + pf);

  const downloadPDF = () => {
    const input = pdfRef.current;
    html2canvas(input, { scale: 2 }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`Payslip_${employee.id}_${employee.name}.pdf`);
    });
  };

  return (
    <div className="payslip-modal-overlay">
      <div className="payslip-modal-content">
        <div className="payslip-actions">
          <button className="download-btn" onClick={downloadPDF}>
            <FiDownload /> Download PDF
          </button>
          <button className="close-payslip" onClick={onClose}>Close</button>
        </div>

        {/* This section is captured for the PDF */}
        <div className="payslip-template" ref={pdfRef}>
          <div className="payslip-header">
            <div className="company-info">
              <h2>MINE-SYNC COAL INDIA LTD.</h2>
              <p>Sector 4, Dhanbad, Jharkhand - 826001</p>
              <p>CIN: U10101JH2024GOI012345</p>
            </div>
            <div className="payslip-title">
              <h1>PAYSLIP</h1>
              <span>February 2026</span>
            </div>
          </div>

          <div className="employee-details-grid">
            <div className="detail-col">
              <p><strong>Employee ID:</strong> {employee.id}</p>
              <p><strong>Name:</strong> {employee.name}</p>
              <p><strong>Designation:</strong> {employee.role}</p>
            </div>
            <div className="detail-col">
              <p><strong>Shift:</strong> {employee.shift}</p>
              <p><strong>Bank A/C:</strong> **** **** 1234</p>
              <p><strong>Aadhaar:</strong> {employee.aadhaar}</p>
            </div>
          </div>

          <table className="salary-table">
            <thead>
              <tr>
                <th>Earnings</th>
                <th>Amount (₹)</th>
                <th>Deductions</th>
                <th>Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td>{baseSalary.toLocaleString()}</td>
                <td>Income Tax (10%)</td>
                <td>{tax.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Mining Allowance</td>
                <td>{allowance.toLocaleString()}</td>
                <td>Provident Fund (PF)</td>
                <td>{pf.toLocaleString()}</td>
              </tr>
              <tr className="total-row">
                <td>Gross Earnings</td>
                <td>{(baseSalary + allowance).toLocaleString()}</td>
                <td>Total Deductions</td>
                <td>{(tax + pf).toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="net-salary-section">
            <div className="net-box">
              <span>NET SALARY PAYABLE</span>
              <h2>₹ {netSalary.toLocaleString()}</h2>
            </div>
            <p className="amount-words">Amount in words: Forty-Eight Thousand Seven Hundred Rupees Only</p>
          </div>

          <div className="footer-sign">
            <div className="sign-box">
              <div className="signature-line"></div>
              <p>Employee Signature</p>
            </div>
            <div className="sign-box">
              <div className="signature-line"></div>
              <p>Authorized Signatory</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaySlip;