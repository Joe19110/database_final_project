import { signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { removeToken } from '../services/auth';
import { toast } from 'react-toastify';

const INACTIVITY_TIMEOUT = 15 * 60 * 1000; // 15 minutes in milliseconds

class InactivityDetector {
  constructor() {
    this.timeout = null;
    this.isSetup = false;
  }

  resetTimer() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
    this.timeout = setTimeout(this.handleInactivity, INACTIVITY_TIMEOUT);
  }

  handleInactivity = async () => {
    try {
      await signOut(auth);
      removeToken();
      toast.warning('Logged out due to inactivity', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      window.location.href = '/';
    } catch (error) {
      console.error('Error during inactivity logout:', error);
    }
  }

  setupActivityListeners() {
    if (this.isSetup) return;

    const events = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click'
    ];

    events.forEach(event => {
      document.addEventListener(event, () => this.resetTimer());
    });

    // Initial setup of timer
    this.resetTimer();
    this.isSetup = true;
  }

  cleanup() {
    if (this.timeout) {
      clearTimeout(this.timeout);
    }
  }
}

export const inactivityDetector = new InactivityDetector(); 