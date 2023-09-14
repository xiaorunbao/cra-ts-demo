// Generated by openapi-ts-gen. DO NOT EDIT
/* eslint-disable */
export interface HealthCheckResult {
  message: string
}
export enum PetType {
  CAT = "CAT",
  DOG = "DOG",
}
export interface CreatePetDto {
  type: PetType
  name: string
  label?: string
  store: string
}
export interface Pet {
  type: PetType
  name: string
  label?: string
  store: string
  id: number
  createAt: string
  updateAt: string
}
export interface UpdatePetDto {
  type?: PetType
  name?: string
  label?: string
  store?: string
}
export enum StoreType {
  PET_STORE = "PET_STORE",
  DOG_STORE = "DOG_STORE",
  CAT_STORE = "CAT_STORE",
}
export interface CreateStoreDto {
  type?: StoreType
  name: string
  address?: string
}
export interface Store {
  type?: StoreType
  name: string
  address?: string
}
export interface HelloRequest {
}
export interface CreatePetRequest {
  body: CreatePetDto
}
export interface ListPetsRequest {
}
export interface GetPetRequest {
  id: number
}
export interface UpdatePetRequest {
  id: number
  body: UpdatePetDto
}
export interface DeletePetRequest {
  id: number
}
export interface CreateStoreRequest {
  body: CreateStoreDto
}
export interface ListStoreRequest {
  type?: StoreType
  _limit?: number
  _offset?: number
  _sort?: string
  create_at_gte?: string
  create_at_lte?: string
  name?: string
}