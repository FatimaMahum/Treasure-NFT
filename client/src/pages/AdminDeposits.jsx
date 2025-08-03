import { useState, useEffect } from 'react';
import { useAuth } from "../contexts/AuthContext";
import { toast } from "react-toastify";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import styles from "./AdminDeposits.module.css";

const AdminDeposits = () => {
  const { user, token } = useAuth();
  const [deposits, setDeposits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [selectedDeposit, setSelectedDeposit] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [notes, setNotes] = useState("");

  useEffect(() => {
    if (user && user.role === 'admin') {
      fetchDeposits();
    }
  }, [user, token]);

  const fetchDeposits = async () => {
    try {
      console.log("🔍 Fetching deposits for admin...");
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/deposits/all`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      console.log("📊 Deposits response:", response.data);

      if (response.data.success) {
        setDeposits(response.data.deposits);
        console.log(`✅ Found ${response.data.deposits.length} deposits`);
      }
    } catch (error) {
      console.error("❌ Failed to fetch deposits:", error);
      toast.error("Failed to fetch deposits");
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (depositId) => {
    setApproving(depositId);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/deposits/${depositId}/approve`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Deposit approved successfully! Email notification sent to user.");
        fetchDeposits();
        setShowModal(false);
        setNotes("");
        setSelectedDeposit(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to approve deposit");
    } finally {
      setApproving(null);
    }
  };

  const handleReject = async (depositId) => {
    setRejecting(depositId);
    try {
      const response = await axios.put(
        `${process.env.REACT_APP_BACKEND_URL}/deposits/${depositId}/reject`,
        { notes },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      if (response.data.success) {
        toast.success("Deposit rejected successfully! Email notification sent to user.");
        fetchDeposits();
        setShowModal(false);
        setNotes("");
        setSelectedDeposit(null);
      }
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to reject deposit");
    } finally {
      setRejecting(null);
    }
  };

  const openModal = (deposit, action) => {
    setSelectedDeposit({ ...deposit, action });
    setShowModal(true);
    setNotes("");
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'pending':
        return <span className={styles.statusPending}>Pending</span>;
      case 'approved':
        return <span className={styles.statusApproved}>Approved</span>;
      case 'rejected':
        return <span className={styles.statusRejected}>Rejected</span>;
      default:
        return <span className={styles.statusPending}>Unknown</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  if (!user || user.role !== 'admin') {
    return (
      <>
        <Navbar />
        <div className={styles.unauthorized}>
          <h2>Access Denied</h2>
          <p>You don't have permission to access this page.</p>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className={styles.adminContainer}>
        <div className={styles.adminHeader}>
          <h1>Deposit Management</h1>
          <p>Review and manage user deposit submissions</p>
        </div>

        {loading ? (
          <div className={styles.loading}>
            <div className={styles.spinner}></div>
            <p>Loading deposits...</p>
          </div>
        ) : (
          <div className={styles.depositsGrid}>
            {deposits.length === 0 ? (
              <div className={styles.noDeposits}>
                <h3>No deposits found</h3>
                <p>There are no deposit submissions to review.</p>
              </div>
            ) : (
              deposits.map((deposit) => (
                <div key={deposit._id} className={styles.depositCard}>
                  <div className={styles.depositHeader}>
                    <div className={styles.userInfo}>
                      <h3>{deposit.userId?.name || 'Unknown User'}</h3>
                      <p>{deposit.userEmail}</p>
                    </div>
                    <div className={styles.amountInfo}>
                      <span className={styles.amount}>${deposit.amount}</span>
                      {getStatusBadge(deposit.status)}
                    </div>
                  </div>

                  <div className={styles.depositDetails}>
                    <p><strong>Submitted:</strong> {formatDate(deposit.createdAt)}</p>
                    {deposit.approvedAt && (
                      <p><strong>Processed:</strong> {formatDate(deposit.approvedAt)}</p>
                    )}
                    {deposit.adminNotes && (
                      <p><strong>Notes:</strong> {deposit.adminNotes}</p>
                    )}
                  </div>

                  {deposit.status === 'pending' && (
                    <div className={styles.actionButtons}>
                      <button
                        onClick={() => openModal(deposit, 'approve')}
                        className={styles.approveBtn}
                      >
                        ✅ Approve
                      </button>
                      <button
                        onClick={() => openModal(deposit, 'reject')}
                        className={styles.rejectBtn}
                      >
                        ❌ Reject
                      </button>
                    </div>
                  )}

                                     {deposit.screenshot && (
                     <div className={styles.screenshotSection}>
                       <h4>Screenshot:</h4>
                                                                                                 <div style={{ marginBottom: '10px', fontSize: '12px', color: '#666' }}>
                           Path: {deposit.screenshot}
                         </div>
                                                                                                 <div 
                           style={{ 
                             maxWidth: '20%', 
                             maxHeight: '250px',
                             border: '2px solid #ffd700', 
                             borderRadius: '12px',
                             backgroundColor: '#f8f9fa',
                             display: 'flex',
                             alignItems: 'center',
                             justifyContent: 'center',
                             marginTop: '10px',
                             minHeight: '120px',
                             cursor: 'pointer',
                             transition: 'all 0.3s ease',
                             overflow: 'hidden',
                             position: 'relative',
                             boxShadow: '0 4px 15px rgba(255, 215, 0, 0.1)'
                           }}
                           onMouseEnter={(e) => {
                             e.currentTarget.style.transform = 'scale(1.02)';
                             e.currentTarget.style.boxShadow = '0 8px 25px rgba(255, 215, 0, 0.2)';
                             e.currentTarget.style.borderColor = '#ffed4e';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.transform = 'scale(1)';
                             e.currentTarget.style.boxShadow = '0 4px 15px rgba(255, 215, 0, 0.1)';
                             e.currentTarget.style.borderColor = '#ffd700';
                           }}
                           onClick={() => {
                             const baseUrl = process.env.REACT_APP_BACKEND_URL.replace('/api', '');
                             const url = `${baseUrl}/${deposit.screenshot}`;
                             window.open(url, '_blank');
                           }}
                           title="Click to view full size"
                         >
                           <img 
                             src={`${process.env.REACT_APP_BACKEND_URL.replace('/api', '')}/${deposit.screenshot}`}
                             alt="Transaction Screenshot"
                             className={styles.screenshot}
                                                          style={{ 
                               maxWidth: '100%', 
                               maxHeight: '100%',
                               width: 'auto',
                               height: 'auto', 
                               objectFit: 'contain',
                               transition: 'transform 0.3s ease'
                             }}
                             onLoad={(e) => {
                               console.log('✅ Screenshot loaded successfully:', deposit.screenshot);
                               console.log('✅ Image dimensions:', e.target.naturalWidth, 'x', e.target.naturalHeight);
                               console.log('✅ Image src:', e.target.src);
                               // Hide error message when image loads successfully
                               const errorElement = e.target.parentElement.nextElementSibling;
                               if (errorElement && errorElement.classList.contains('screenshotError')) {
                                 errorElement.style.display = 'none';
                               }
                             }}
                             onError={(e) => {
                               console.log('❌ Screenshot failed to load:', deposit.screenshot);
                               console.log('❌ Full URL:', `${process.env.REACT_APP_BACKEND_URL.replace('/api', '')}/${deposit.screenshot}`);
                               console.log('❌ Backend URL:', process.env.REACT_APP_BACKEND_URL);
                               e.target.style.display = 'none';
                               // Show error message
                               const errorElement = e.target.parentElement.nextElementSibling;
                               if (errorElement && errorElement.classList.contains('screenshotError')) {
                                 errorElement.style.display = 'block';
                               }
                             }}
                           />
                           <div style={{
                             position: 'absolute',
                             top: '8px',
                             right: '8px',
                             background: 'rgba(0, 0, 0, 0.7)',
                             color: 'white',
                             padding: '4px 8px',
                             borderRadius: '4px',
                             fontSize: '10px',
                             fontWeight: 'bold',
                             opacity: '0',
                             transition: 'opacity 0.3s ease'
                           }}
                           onMouseEnter={(e) => {
                             e.currentTarget.style.opacity = '1';
                           }}
                           onMouseLeave={(e) => {
                             e.currentTarget.style.opacity = '0';
                           }}
                           >
                             🔍 View
                           </div>
                         </div>
                         <p className={styles.screenshotError} style={{display: 'none', color: '#ff6b6b', fontSize: '14px', marginTop: '10px'}}>
                           Screenshot not available
                         </p>
                     </div>
                   )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Modal for approve/reject */}
        {showModal && selectedDeposit && (
          <div className={styles.modalOverlay} onClick={() => setShowModal(false)}>
            <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
              <div className={styles.modalHeader}>
                <h3>
                  {selectedDeposit.action === 'approve' ? 'Approve' : 'Reject'} Deposit
                </h3>
                <button 
                  onClick={() => setShowModal(false)}
                  className={styles.closeBtn}
                >
                  ×
                </button>
              </div>

              <div className={styles.modalContent}>
                <div className={styles.depositInfo}>
                  <p><strong>User:</strong> {selectedDeposit.userId?.name}</p>
                  <p><strong>Email:</strong> {selectedDeposit.userEmail}</p>
                  <p><strong>Amount:</strong> ${selectedDeposit.amount}</p>
                  <p><strong>Submitted:</strong> {formatDate(selectedDeposit.createdAt)}</p>
                </div>

                <div className={styles.notesSection}>
                  <label htmlFor="notes">Notes (optional):</label>
                  <textarea
                    id="notes"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about this decision..."
                    rows="3"
                  />
                  <small style={{color: '#666', fontSize: '12px', marginTop: '5px'}}>
                    💡 Notes will be included in the email notification sent to the user.
                  </small>
                </div>

                <div className={styles.modalActions}>
                  <button
                    onClick={() => setShowModal(false)}
                    className={styles.cancelBtn}
                  >
                    Cancel
                  </button>
                  {selectedDeposit.action === 'approve' ? (
                    <button
                      onClick={() => handleApprove(selectedDeposit._id)}
                      disabled={approving === selectedDeposit._id}
                      className={styles.confirmApproveBtn}
                    >
                      {approving === selectedDeposit._id ? 'Approving...' : '✅ Approve'}
                    </button>
                  ) : (
                    <button
                      onClick={() => handleReject(selectedDeposit._id)}
                      disabled={rejecting === selectedDeposit._id}
                      className={styles.confirmRejectBtn}
                    >
                      {rejecting === selectedDeposit._id ? 'Rejecting...' : '❌ Reject'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
};

export default AdminDeposits; 