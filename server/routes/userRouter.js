import { Router } from 'express'
import { compare, hash } from 'bcrypt'
import jwt from 'jsonwebtoken'

const { sign } = jwt

