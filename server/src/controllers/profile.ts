import { Prisma, PrismaClient } from "@prisma/client"
import { Request, Response } from "express"
import bcrypt from "bcryptjs"
import { RequestWithUser } from "../middleware/auth"

const prisma = new PrismaClient()

export const changePassword = async (req: RequestWithUser, res: Response) => {
    const { currentPassword, newPassword, confirmPassword, } = req.body

    const user = req.user

    if (!currentPassword || !newPassword || !confirmPassword) {
        return res.status(400).send({ message: "All fields are required" })
    }

    if (currentPassword === newPassword) {
        return res.status(400).send({ message: "Old password and new password cannot be the same" })
    }

    if (newPassword !== confirmPassword) {
        return res.status(400).send({ message: "New password and confirm password do not match" })
    }

    if (!user || !user.password) {
        return res.status(402).send({ message: "User not authenticated or password not found" })
    }

    const isPasswordValid = await bcrypt.compare(currentPassword, user.password)
    if (!isPasswordValid) {
        return res.status(402).send({ message: "Current password is incorrect" })
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10)

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { password: hashedPassword }
        },
        )
    } catch (error) {
        console.error("Error updating password:", error)
        return res.status(500).send({ message: "Failed to update password" })
    }

    return res.status(200).send({ message: "Password changed successfully" })
}

export const forgotPassword = (req: Request, res: Response) => {
    const { email } = req.body

    if (!email) {
        res.status(204).send({ message: "Email is required" })
    }

    res.status(200).send({ message: "Password reset email sent successfully" })
}

export const updateStudentDetails = async (req: Request, res: Response) => {
    const { firstName, lastName, email } = req.body

    const data: Prisma.StudentUpdateInput = {}
    if (firstName) data.firstName = firstName
    if (lastName) data.lastName = lastName
    if (email) data.user = {
        update: {
            email,
        }
    }

    const user = await prisma.student.update({
        where: { id: Number(req.params.id) },
        data,
    })

    res.send(user)
}

export const updateStaffDetails = async (req: Request, res: Response) => {
    const { firstName, lastName, email } = req.body

    const data: Prisma.StaffUpdateInput = {}
    if (firstName) data.firstName = firstName
    if (lastName) data.lastName = lastName
    if (email) data.user = {
        update: {
            email,
        }
    }

    const user = await prisma.staff.update({
        where: { id: Number(req.params.id) },
        data,
    })

    res.send(user)
}