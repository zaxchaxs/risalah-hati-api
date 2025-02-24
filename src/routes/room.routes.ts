import { Router } from "express";
import { deleteRoom, getDetailRoom, getLatesRoomChat, getRoomByTitle, getRooms, postRoom, updateRoom } from "../controllers/room.controller";
import { updateRoomMiddleware, addRoomMiddleware, deleteRoomMiddleware} from "../middlewares/room";

const router = Router();

router.get("/", getRooms);
router.get("/latest", getLatesRoomChat);
router.get("/title/:title", getRoomByTitle);
router.get("/:id", getDetailRoom);
router.post("/post", addRoomMiddleware, postRoom);
router.put("/:id", updateRoomMiddleware, updateRoom);
router.delete("/:id", deleteRoomMiddleware, deleteRoom);

export default router;