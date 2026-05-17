import { useState, useEffect, useRef, useCallback } from "react";
import "./Login.css";
import "./GlobalEffects.css";
import AssetManifest from "../services/AssetManifest";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import ParticleEffects from "../components/ParticleEffects";
import SaveProgressModal from "../components/progress/SaveProgressModal";
import { hasExistingPlayer, getSavedPlayer } from "../utils/playerStorage";

const Login = () => {
    const navigate = useNavigate();
    const { player, createNewPlayer, startNewGame } = useAuth();

    const [nickname, setNickname] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showError, setShowError] = useState(false);
    const errorTimerRef = useRef(null);

    // Show error as a toast notification with auto-dismiss
    const triggerError = useCallback((message) => {
        // Clear any existing timer
        if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        setError(message);
        setShowError(true);
        errorTimerRef.current = setTimeout(() => {
            setShowError(false);
            // Clear the message after the fade-out animation
            setTimeout(() => setError(""), 400);
        }, 5000);
    }, []);

    // Cleanup timer on unmount
    useEffect(() => {
        return () => {
            if (errorTimerRef.current) clearTimeout(errorTimerRef.current);
        };
    }, []);
    const [showAccountModal, setShowAccountModal] = useState(false);
    const [savedPlayer, setSavedPlayer] = useState(null);

    // Track whether this component initiated a new player creation
    // so the auto-navigate effect doesn't fire mid-flow
    const isCreatingPlayer = useRef(false);

    // ── UC-1.2: Check localStorage once on mount only ─────────────────────────
    useEffect(() => {
        if (hasExistingPlayer()) {
            const saved = getSavedPlayer();
            setSavedPlayer(saved);
            setShowAccountModal(true);
            console.log('🔍 Existing player found:', saved.nickname);
        }
    }, []);

    //  Auto-navigate ONLY for returning players (not mid-creation flow)
    useEffect(() => {
        if (player && !showAccountModal && !isCreatingPlayer.current) {
            console.log('✅ Player loaded, navigating to dashboard');
            navigate("/dashboard");
        }
    }, [player, showAccountModal, navigate]);

    //Create new player 
    const handlePlayNow = async (e) => {
        e.preventDefault();
        setShowError(false);
        setError("");

        if (!nickname.trim()) {
            triggerError('Please enter your name to start playing!');
            return;
        }

        setLoading(true);
        isCreatingPlayer.current = true; // block auto-navigate

        try {
            const result = await createNewPlayer(nickname.trim());

            if (!result.success) {
                triggerError(result.error || 'Failed to create player. Please try again!');
                isCreatingPlayer.current = false;
                return;
            }

            console.log('✅ Player created, navigating to loading screen...');
            navigate("/loading");

        } catch (err) {
            console.error("❌ Error starting game:", err);
            triggerError("Something went wrong. Please try again!");
            isCreatingPlayer.current = false;
        } finally {
            setLoading(false);
        }
    };

    //Continue — just close modal and go to dashboard
    const handleContinueExisting = () => {
        console.log('✅ Continuing as:', savedPlayer?.nickname);
        setShowAccountModal(false);
        navigate("/loading", { state: { redirectTo: "/dashboard" } });
    };

    // New Game — wipe everything, show nickname form
    const handleNewGame = () => {
        console.log('🆕 New game — clearing player data');
        startNewGame();
        setShowAccountModal(false);
        setSavedPlayer(null);
    };

    // Save Progress Modal (UC-1.2)
    if (showAccountModal) {
        return (
            <div className="login-page">
                <div className="login-background"></div>
                <ParticleEffects enableMouseTrail={true} />
                <SaveProgressModal
                    isOpen={showAccountModal}
                    onContinue={handleContinueExisting}
                    onNewGame={handleNewGame}
                    onClose={() => { }}
                />
            </div>
        );
    }

    // Enter Name screen
    return (
        <div className="login-page">
            <div className="login-background"></div>
            <ParticleEffects enableMouseTrail={true} />

            <div className="character-container">
                <img src={AssetManifest.characters.boy} alt="Boy Character" className="character boy-character" />
                <img src={AssetManifest.characters.girl} alt="Girl Character" className="character girl-character" />
            </div>

            {/* Error Toast Notification */}
            {error && (
                <div className={`error-toast ${showError ? 'error-toast--visible' : 'error-toast--hidden'}`}>
                    <div className="error-toast-icon">⚠️</div>
                    <span className="error-toast-message">{error}</span>
                    <button
                        className="error-toast-close"
                        onClick={() => { setShowError(false); setTimeout(() => setError(""), 400); }}
                        aria-label="Dismiss error"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="login-card-wrapper">
                <div className="login-card">
                    <h1 className="login-title">BisaQuest</h1>

                    <p className="welcome-subtitle">
                        Sugdi ang imong adventure!
                    </p>

                    <form onSubmit={handlePlayNow} className="login-form-container">
                        <div className="form-group">
                            <label htmlFor="nickname" className="form-label">
                                Enter Your First Name
                            </label>
                            <input
                                type="text"
                                id="nickname"
                                name="nickname"
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                className="form-input-login"
                                placeholder="Your name here"
                                maxLength={50}
                                autoFocus
                                disabled={loading}
                            />
                        </div>

                        <button
                            type="submit"
                            className="login-button"
                            disabled={loading || !nickname.trim()}
                        >
                            {loading ? "Creating..." : "Play Now"}
                        </button>
                    </form>

                    <div className="game-info">
                        <p className="info-text">
                            Ang imong progress ma-save automatically!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;