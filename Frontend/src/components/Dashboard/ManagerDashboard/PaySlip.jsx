import React, { useState, useEffect, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { FiDownload, FiFileText, FiPrinter } from 'react-icons/fi';
import api from '../../../api';
import './PaySlip.css';

const PaySlip = ({ employee, onClose }) => {
  const pdfRef = useRef();
  const [payslip, setPayslip] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPayslip = async () => {
      try {
        const response = await api.get(`/employee/payslips/${employee.id}`);
        // Get the latest payslip
        const latestPayslip = response.data.payslips[0];
        setPayslip(latestPayslip);
        setLoading(false);
      } catch (error) {
        console.error('Failed to fetch payslip:', error);
        setLoading(false);
      }
    };
    fetchPayslip();
  }, [employee.id]);

  // Mock data if no real payslip
  const mockPayslip = {
    month: 2,
    year: 2026,
    basic_salary: 45000,
    hra: 9000,
    conveyance: 1920,
    medical: 1250,
    lta: 0,
    pf_employee: 5400,
    pf_employer: 5400,
    gratuity: 1350,
    esi_employee: 585,
    esi_employer: 585,
    professional_tax: 2400,
    income_tax: 4500,
    other_deductions: 0,
    gross_earnings: 56170,
    total_deductions: 19435,
    net_pay: 36735
  };

  const data = payslip || mockPayslip;

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
              <span>{new Date(data.year, data.month - 1).toLocaleString('default', { month: 'long' })} {data.year}</span>
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
                <td>{data.basic_salary.toLocaleString()}</td>
                <td>Provident Fund (Employee)</td>
                <td>{data.pf_employee.toLocaleString()}</td>
              </tr>
              <tr>
                <td>HRA</td>
                <td>{data.hra.toLocaleString()}</td>
                <td>ESI (Employee)</td>
                <td>{data.esi_employee.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Conveyance Allowance</td>
                <td>{data.conveyance.toLocaleString()}</td>
                <td>Professional Tax</td>
                <td>{data.professional_tax.toLocaleString()}</td>
              </tr>
              <tr>
                <td>Medical Allowance</td>
                <td>{data.medical.toLocaleString()}</td>
                <td>Income Tax</td>
                <td>{data.income_tax.toLocaleString()}</td>
              </tr>
              <tr>
                <td>LTA</td>
                <td>{data.lta.toLocaleString()}</td>
                <td>Other Deductions</td>
                <td>{data.other_deductions.toLocaleString()}</td>
              </tr>
              <tr className="total-row">
                <td>Gross Earnings</td>
                <td>{data.gross_earnings.toLocaleString()}</td>
                <td>Total Deductions</td>
                <td>{data.total_deductions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div className="net-salary-section">
            <div className="net-box">
              <span>NET SALARY PAYABLE</span>
              <h2>₹ {data.net_pay.toLocaleString()}</h2>
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