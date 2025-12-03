import { Candidate, CandidateStatus, Notification, User, UserRole } from "../types";

const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

export const getNotifications = (candidates: Candidate[], currentUser: User): Notification[] => {
  const alerts: Notification[] = [];
  const now = new Date();

  // Filter candidates relevant to the current user
  const visibleCandidates = currentUser.role === UserRole.RECRUITER
    ? candidates.filter(c => c.recruiterId === currentUser.id)
    : candidates;

  visibleCandidates.forEach(candidate => {
    // 1. Check for expiring or expired DBS checks for HIRED candidates
    if (candidate.status === CandidateStatus.HIRED && candidate.dbsExpiryDate) {
      const expiryDate = new Date(candidate.dbsExpiryDate);
      const timeDiff = expiryDate.getTime() - now.getTime();

      if (timeDiff < 0) {
        alerts.push({
          id: `dbs-exp-${candidate.id}`,
          message: `${candidate.name}'s DBS check has expired.`,
          read: false,
          date: new Date().toISOString(),
          type: 'error',
        });
      } else if (timeDiff < THIRTY_DAYS_IN_MS) {
        alerts.push({
          id: `dbs-near-exp-${candidate.id}`,
          message: `${candidate.name}'s DBS check is expiring soon.`,
          read: false,
          date: new Date().toISOString(),
          type: 'warning',
        });
      }
    }

    // 2. Check for HIRED candidates with unsigned contracts
    if (candidate.status === CandidateStatus.HIRED && !candidate.contractSigned) {
      alerts.push({
        id: `contract-${candidate.id}`,
        message: `${candidate.name} is hired but has not signed their contract.`,
        read: false,
        date: new Date().toISOString(),
        type: 'info',
      });
    }
  });

  return alerts.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};
