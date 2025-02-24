import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import prisma from "../configs/prismaClient";


export const getRooms = async (req: Request, res: Response) => {
    try {
        const rooms = await prisma.room.findMany();
        res.status(200).json(successResponse(rooms));
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(errorResponse(500, 'Internal Server Error', error, errMessage))
    }
};

export const getDetailRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const room = await prisma.room.findUnique({
            where: {
                id
            }
        });

        if (!room) {
            res.status(404).json(errorResponse(404, 'not found', "Data Not Found", "Room Not Found"))
            return;
        };

        res.status(200).json(successResponse(room));
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(errorResponse(500, 'Internal Server Error', error, errMessage))
    }
}

export const postRoom = async (req: Request, res: Response) => {
    try {
        const { title, description, image, authorId, } = req.body;
        
        const room = await prisma.room.create({
            data: {
                title,
                description,
                image,
                authorId,
            },
            select: {
                id: true,
                title: true,
                description: true,
                image: true,
                authorId: true,
            }
        })

        await prisma.userRoom.create({
            data: {
                userId: authorId,
                roomId: room.id
            }
        });

        res.status(200).json(
            successResponse(room)
        );

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const updateRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { title, description, image } = req.body;

        const response = await prisma.room.update({
            where: {
                id
            },
            data: {
                title,
                description,
                image,
            },
            select: {
                id: true,
                title: true,
                description: true,
                image: true
            }
        })
        
        res.status(200).json(
            successResponse(response)
        )
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const deleteRoom = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const room = await prisma.room.delete({
            where: {
                id
            }
        })
        res.status(200).json(
            successResponse(null, `${room.description} deleted`)
        );
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const getLatesRoomChat = async (req: Request, res: Response) => {
    try{
        const { id } = req.params;
        const rooms = await prisma.room.findMany({
            where: {
                id: id
            },
        });
        res.status(200).json(successResponse(rooms));
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const getRoomByTitle = async (req: Request, res: Response) => {
    try{
        const { title } = req.params;
        const rooms = await prisma.room.findMany({
            where: {
                title: {
                    contains: title,
                }
            },
        });
        res.status(200).json(successResponse(rooms));
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}