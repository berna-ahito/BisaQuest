import { useNavigate } from "react-router-dom";
import { hasLibroPage, hasCutsceneSeen } from "../../../utils/playerStorage";
import Button from "../../../components/Button";
import "./VillageRoomProgress.css";

/**
 * VillageRoomProgress
 * Shows navigation hints at the bottom of each Village room page.
 * - If current room book is collected, tells the player where to go next:
 *   • If an incomplete room exists → "Kusina/Kwarto/Sala is not yet complete! Click to proceed."
 *   • If all 3 rooms complete      → "All rooms are complete! Click to proceed to the Forest! 🌲"
 */

const ROOMS = [
  { key: "village_house",   label: "Sala",   labelEn: "Living Room", route: "/student/house" },
  { key: "village_kitchen", label: "Kusina", labelEn: "Kitchen",     route: "/student/kitchen" },
  { key: "village_bedroom", label: "Kwarto", labelEn: "Bedroom",     route: "/student/bedroom" },
];

const VillageRoomProgress = ({
  currentRoomKey,
  npcId,
  npcName,
  introDone,
  activeItem,
  questItem,
  showDoorChoice,
  showPageModal,
  showSummary,
}) => {
  const navigate = useNavigate();

  const currentRoomDone = hasLibroPage("village", currentRoomKey);

  // Don't show anything if:
  // 1. Current room's book hasn't been collected yet
  // 2. The intro dialogues are still playing
  // 3. The user is actively interacting with something (dialogue, mini-game, modals)
  const isInteracting =
    activeItem || questItem || showDoorChoice || showPageModal || showSummary;

  if (!currentRoomDone || !introDone || isInteracting) return null;

  // Check all rooms
  const roomStatus = ROOMS.map((r) => ({
    ...r,
    done: hasLibroPage("village", r.key),
  }));

  const incompleteRooms = roomStatus.filter((r) => !r.done);
  const allDone = incompleteRooms.length === 0;

  // Navigate to an incomplete room
  const handleGoToRoom = (room) => {
    navigate(room.route, {
      state: {
        npcId: npcId || "village_npc_2",
        npcName: npcName || "Ligaya",
        returnTo: "/student/village",
      },
    });
  };

  // Navigate to forest (respecting cutscene)
  const handleGoToForest = () => {
    if (!hasCutsceneSeen("village_complete")) {
      navigate("/cutscene/village_complete", { replace: true });
    } else {
      navigate("/student/forest", { replace: true });
    }
  };

  if (allDone) {
    return (
      <div className="village-room-progress">
        <Button variant="primary" onClick={handleGoToForest}>
          Human na tanan! Padayon sa Kalasangan! · All done! Proceed to Forest! →
        </Button>
      </div>
    );
  }

  // Show incomplete rooms
  return (
    <div className="village-room-progress">
      {incompleteRooms
        .filter((r) => r.key !== currentRoomKey) // Don't suggest current room
        .map((room) => (
          <Button
            key={room.key}
            variant="primary"
            onClick={() => handleGoToRoom(room)}
          >
            Adto sa {room.label}! · Go to {room.labelEn}! →
          </Button>
        ))}
    </div>
  );
};

export default VillageRoomProgress;
