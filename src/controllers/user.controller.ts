import bcrypt from 'bcrypt';
import { Request, Response } from "express";
import { errorResponse, successResponse } from "../utils/response";
import { generateToken, verifyToken } from '../utils/jwt';
import prisma from '../configs/prismaClient';

export const getUsers = async (req: Request, res: Response) => {
    try {
        const users = await prisma.user.findMany();
        res.status(200).json({
            ...successResponse(users)
        });
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json({
            ...errorResponse(500, 'Internal Server Error', error, errMessage)
        })
    }
};

export const getDetailUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const user = await prisma.user.findUnique({
            where: {
                id: id
            }
        });

        if (!user) {
            res.status(404).json(errorResponse(404, 'not found', "Data Not Found", "User Not Found"));
            return;
        };

        res.status(200).json(
            successResponse(user)
        );
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const postUser = async (req: Request, res: Response) => {
    try {
        const { email, username, name, role, password } = req.body;
        // cek email sudah terdaftar
        const duplicateUser = await prisma.user.findFirst({
            where: {
                OR: [{ email }, { username }]
            }
        })

        if (duplicateUser) {
            res.status(409).json(errorResponse(409, 'Conflict', "Conflict", "Email or Username already taken"))
            return;
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                email,
                username,
                name,
                role,
                password: hashedPassword,
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                profilePic: true,
                bannerPic: true,
            }
        });

        res.status(200).json(
            successResponse(user)
        );

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const updateUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const { email, username, name, role, profilePic, bannerPic, bio } = req.body;

        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { email },
                    { username }
                ],
                NOT: { id }
            }
        });

        if (existingUser) {
            res.status(400).json(
                errorResponse(400, 'bad request', "Bad Request", "Email or username is already in use.")
            );
            return;
        }

        const user = await prisma.user.update({
            where: {
                id
            },
            data: {
                email,
                username,
                name,
                role,
                bio,
                profilePic,
                bannerPic,
            },
            select: {
                id: true,
                email: true,
                username: true,
                name: true,
                role: true,
                profilePic: true,
                bannerPic: true,
            }
        });

        res.status(200).json(
            successResponse(user)
        )
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const deleteUser = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        const user = await prisma.user.delete({
            where: {
                id
            }
        });
        res.status(200).json(
            successResponse(null, `${user.name} deleted`)
        );
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage);
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password: userPassword } = req.body;

        const user = await prisma.user.findUnique({
            where: {
                email
            }
        });

        if (!user) {
            res.status(404).json(errorResponse(404, 'not found', "Data Not Found", "User not found!"))
            return;
        };

        const isValidPassword = await bcrypt.compare(userPassword, user.password);

        if (!isValidPassword) {
            res.status(404).json(errorResponse(401, 'Unauthorized', "Unauthorized", "Wrong email or password"))
            return;
        };
        const { password, ...filteredUserData } = user;

        const token = generateToken(filteredUserData);

        res.status(200).json({
            ...successResponse(filteredUserData),
            token,
        }
        );

    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
};

export const verifyTokenUser = async (req: Request, res: Response) => {
    const { token } = req.body;

    try {
        const result = verifyToken(token);
        res.status(200).json(
            successResponse(result)
        );
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}

export const getUsersByUsername = async (req: Request, res: Response) => {
    try {
        const { username } = req.params;
        const users = await prisma.user.findMany({
            where: {
                username: {
                    contains: username,
                }
            }
        });

        if (users.length === 0) {
            res.status(404).json(errorResponse(404, 'not found', "Data Not Found", "User Not Found"));
            return;
        };

        res.status(200).json({
            ...successResponse(users)
        });
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage);
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        );
    }
};


export const getUserByEmail = async (req: Request, res: Response) => {
    try {
        const { email } = req.params;
        const users = await prisma.user.findMany({
            where: {
                email: email
            }
        });

        if (!users) {
            res.status(404).json(errorResponse(404, 'not found', "Data Not Found", "User Not Found"));
            return;
        };

        res.status(200).json({
            ...successResponse(users)
        });
    } catch (error) {
        const errMessage = error instanceof Error ? error.message : "An unknown error occurred";
        console.error(errMessage)
        res.status(500).json(
            errorResponse(500, 'Internal Server Error', error, errMessage)
        )
    }
}