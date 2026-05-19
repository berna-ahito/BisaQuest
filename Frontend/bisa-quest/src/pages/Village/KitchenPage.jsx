import { useState, useEffect, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Button from "../../components/Button";
import DialogueBox from "../../components/instructions/DialogueBox";
import AssetManifest from "../../services/AssetManifest";
import HouseDebugTools from "./components/HouseDebugTools";
import BilingualText from "./components/BilingualText";
import ItemQuestModal from "../../game/components/ItemQuestModal";
import { NPC_IMAGES } from "./data/kitchenData";
import {
  SCENE_QUEST_IDS,
  fetchSceneItems,
  fetchSceneDialogues,
  toSceneLabels,
  toIntroDialogue,
} from "../../services/sceneDataService";
import BookCollectModal from "../../game/components/BookCollectModal";
import VillageTransitionModal from "../../game/components/VillageTransitionModal";
import VillageSummaryModal from "../../game/components/VillageSummaryModal";
import FogTransition from "../../components/FogTransition";
import VillageRoomProgress from "./components/VillageRoomProgress";
import { awardLibroPage, getLibroPageCount, hasLibroPage, hasCutsceneSeen, markCompleteDismissed, saveNPCProgress, getNPCWords, getPlayerId } from "../../utils/playerStorage";
import { submitChallenge } from "../../services/playerServices";
import "./HousePage.css"; // Reuse house CSS for now as the layout is identical

const KitchenPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const npcId = location.state?.npcId || "village_npc_2";
  const npcName = location.state?.npcName || "Ligaya";
  const returnTo = location.state?.returnTo || "/student/village";
  const playerId = getPlayerId();

  const NpcImage = NPC_IMAGES[npcId] || AssetManifest.village.npcs.ligaya;

  // ── Scene data from API ────────────────────────────────────────────────────
  const [sceneLabels, setSceneLabels] = useState([]);
  const [introDialogue, setIntroDialogue] = useState([]);
  const [dataLoaded, setDataLoaded] = useState(false);

  const [debugMode, setDebugMode] = useState(false);
  const [selectedRegion, setSelectedRegion] = useState(null);
  const [introStep, setIntroStep] = useState(0);
  const [activeItem, setActiveItem] = useState(null);
  const [dialogueStep, setDialogueStep] = useState(0);
  const [questItem, setQuestItem] = useState(null);
  const [completedItems, setCompletedItems] = useState(new Set());
  const [showDoorChoice, setShowDoorChoice] = useState(false);
  const [showPageModal, setShowPageModal] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [fogActive, setFogActive] = useState(false);
  const [collectedPage, setCollectedPage] = useState(null);

  const pendingQuestRef = useRef(null);

  useEffect(() => {
    if (pendingQuestRef.current && !activeItem) {
      setQuestItem(pendingQuestRef.current);
      pendingQuestRef.current = null;
    }
  }, [activeItem]);

  // ── Fetch scene data from API on mount ─────────────────────────────────────
  useEffect(() => {
    const loadSceneData = async () => {
      const questId = SCENE_QUEST_IDS.kitchen;
      const [items, dialogues] = await Promise.all([
        fetchSceneItems(questId),
        fetchSceneDialogues(questId),
      ]);
      const labels = toSceneLabels(items);
      setSceneLabels(labels);
      setIntroDialogue(toIntroDialogue(dialogues));
      setDataLoaded(true);

      const savedWords = getNPCWords("village", "village_kitchen");
      if (savedWords.length > 0) {
        const restored = new Set();
        labels.forEach(region => {
          const word = `${region.labelBisaya} (${region.labelEnglish})`;
          if (savedWords.includes(word)) restored.add(region.id);
        });
        if (restored.size > 0) setCompletedItems(restored);
      }
    };
    loadSceneData();
  }, []);

  const introDone = introStep === null;
  const introLine = !introDone ? introDialogue[introStep] : null;

  const buildDialogue = (region) => [
    { speaker: "Ligaya", bisayaText: `Kini ang ${region.labelBisaya}!`, englishText: `This object is called ${region.labelEnglish}!` },
    { speaker: "Ligaya", bisayaText: region.descriptionBisaya, englishText: region.descriptionEnglish },
  ];

  const currentLine = introDone && activeItem
    ? buildDialogue(activeItem)[dialogueStep]
    : null;
  const isLastDialogueLine = activeItem
    ? dialogueStep === buildDialogue(activeItem).length - 1
    : false;

  const handleBack = () => navigate(returnTo);

  const handleIntroNext = () => {
    if (introStep < introDialogue.length - 1) {
      setIntroStep(s => s + 1);
    } else {
      setIntroStep(null);
    }
  };

  const handleItemClick = (region) => {
    if (!introDone || activeItem) return;
    if (debugMode) {
      setSelectedRegion(selectedRegion?.id === region.id ? null : region);
      return;
    }

    setActiveItem(region);
    setDialogueStep(0);
  };

  const handleDialogueNext = () => {
    if (!activeItem) return;
    const lines = buildDialogue(activeItem);

    if (dialogueStep < lines.length - 1) {
      setDialogueStep(s => s + 1);
    } else {
      if (activeItem.id === "door_back_kitchen") {
        setShowDoorChoice(true);
      } else {
        pendingQuestRef.current = activeItem;
      }
      setActiveItem(null);
      setDialogueStep(0);
    }
  };

  const handleQuestComplete = async (region) => {
    setQuestItem(null);
    const next = new Set([...completedItems, region.id]);
    setCompletedItems(next);

    const word = `${region.labelBisaya} (${region.labelEnglish})`;
    const passed = next.size >= 3;

    // Start background tasks
    saveNPCProgress("village", "village_kitchen", next.size, passed, 3, [word]);

    if (playerId && location.state?.questId) {
      submitChallenge(playerId, location.state.questId, npcId, next.size, 3, passed)
        .catch(err => console.error("[KitchenPage] submitChallenge failed:", err));
    }

    if (next.size >= 3) {
      const isNew = awardLibroPage('village', 'village_kitchen');
      if (isNew) {
        setCollectedPage({
          npcName: npcName,
          pageNumber: getLibroPageCount(),
        });
        setShowPageModal(true);
      }
    }
  };

  const handleQuestClose = () => {
    setQuestItem(null);
  };

  const handleFogDone = () => {
    if (!hasCutsceneSeen("village_complete")) {
      navigate("/cutscene/village_complete", { replace: true });
    } else {
      navigate("/student/forest", { replace: true });
    }
  };

  return (
    <div className="kitchen-container">
      <FogTransition active={fogActive} onDone={handleFogDone} label="🌲 Entering the Forest..." />

      <img
        src={AssetManifest.village.scenarios.kitchen}
        alt="Kitchen"
        className="house-background"
        draggable={false}
      />

      <Button variant="back" className="house-back" onClick={handleBack}>
        ← Back
      </Button>

      <div className="house-scene-label">
        {!introDone ? "Story Introduction" : "Explore the Kitchen"}
      </div>

      <HouseDebugTools
        debugMode={debugMode}
        setDebugMode={setDebugMode}
        selectedRegion={selectedRegion}
        setSelectedRegion={setSelectedRegion}
      />

      {introDone && sceneLabels.map(region => {
        const isDone = completedItems.has(region.id);
        return (
          <div
            key={region.id}
            className={[
              "house-hover-region",
              debugMode ? "house-hover-region--debug" : "",
              debugMode && selectedRegion?.id === region.id ? "house-hover-region--selected" : "",
              !debugMode && activeItem?.id === region.id ? "house-hover-region--active" : "",
              !debugMode && isDone ? "house-hover-region--done" : "",
            ].filter(Boolean).join(" ")}
            style={{
              left: `${region.x}%`,
              top: `${region.y}%`,
              width: `${region.w}%`,
              height: `${region.h}%`,
              cursor: debugMode ? "crosshair" : (!introDone || activeItem || questItem ? "default" : "pointer"),
            }}
            onClick={() => handleItemClick(region)}
          >
            {debugMode && (
              <span className="house-debug-badge">{region.id}</span>
            )}

            {!debugMode && !activeItem && !questItem && (
              <span className={`house-item-dot ${isDone ? "house-item-dot--done" : ""}`} />
            )}

            {!debugMode && !activeItem && !questItem && (
              <div className="house-hover-tooltip">
                <span className="house-hover-tooltip-bisaya">{region.labelBisaya}</span>
                <span className="house-hover-tooltip-english">{region.labelEnglish}</span>
                {isDone && (
                  <span className="house-hover-tooltip-done">✓ Nahuman na!</span>
                )}
              </div>
            )}
          </div>
        );
      })}

      <div className="house-npc-wrap">
        <img
          src={NpcImage}
          alt={npcName}
          className={[
            "house-npc-image",
            (introLine || currentLine) ? "house-npc-image--talking" : "",
          ].filter(Boolean).join(" ")}
          draggable={false}
        />
      </div>

      {introLine && (
        <DialogueBox
          title={introLine.speaker}
          text={<BilingualText line={introLine} />}
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleIntroNext}
        />
      )}

      {introDone && currentLine && (
        <DialogueBox
          title={currentLine.speaker}
          text={
            <span className="house-bilingual" style={{ display: 'flex', alignItems: 'center', gap: '40px' }}>
              <span style={{ flex: 'none' }}>
                <span className="house-bilingual-bisaya">{currentLine.bisayaText}</span>
                <span className="house-bilingual-english">{currentLine.englishText}</span>
              </span>
              {isLastDialogueLine && activeItem?.id !== "door_back_kitchen"}
            </span>
          }
          introItem={{
            label: activeItem.labelBisaya,
            imageKey: activeItem.imageKey || activeItem.id,
          }}
          isNarration={false}
          isPlayer={false}
          showNextButton={true}
          onNext={handleDialogueNext}
        />
      )}

      {introDone && !activeItem && !questItem && !debugMode && !hasLibroPage("village", "village_kitchen") && (
        <div className="house-idle-hint">
          <span className="house-idle-hint-bisaya">
            💬 I-click ang bisan unsang butang para makat-on!
          </span>
          <span className="house-idle-hint-english">
            Click on any item to learn more!
          </span>
        </div>
      )}

      {questItem && (
        <ItemQuestModal
          item={questItem}
          npcName={npcName}
          npcImage={NpcImage}
          onClose={handleQuestClose}
          onComplete={handleQuestComplete}
        />
      )}

      {/* ── Book Collect Modal ────────────────────────────────────────────── */}
      <BookCollectModal
        isOpen={showPageModal}
        npcName={collectedPage?.npcName}
        pageNumber={collectedPage?.pageNumber}
        totalPages={getLibroPageCount()}
        environment="kusina"
        onClose={() => {
          setShowPageModal(false);
          setShowDoorChoice(true);
        }}
      />

      {/* ── Door Choice & Summary Modals ────────────────────────────────── */}
      <VillageTransitionModal
        isOpen={showDoorChoice}
        currentRoom="kitchen"
        onClose={() => setShowDoorChoice(false)}
        onProceedToForest={() => {
            setShowDoorChoice(false);
            setShowSummary(true);
        }}
      />
      
      <VillageSummaryModal
        isOpen={showSummary}
        onClose={() => setShowSummary(false)}
        onProceed={() => {
            markCompleteDismissed("village");
            setFogActive(true);
        }}
      />

      {/* ── Room progress navigation ──────────────────────────────────── */}
      <VillageRoomProgress
        currentRoomKey="village_kitchen"
        npcId={npcId}
        npcName={npcName}
        introDone={introDone}
        activeItem={activeItem}
        questItem={questItem}
        showDoorChoice={showDoorChoice}
        showPageModal={showPageModal}
        showSummary={showSummary}
      />

    </div>
  );
};

export default KitchenPage;
