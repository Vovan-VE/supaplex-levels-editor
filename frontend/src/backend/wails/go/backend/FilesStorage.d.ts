// This file is automatically generated. DO NOT EDIT
import { files } from "../models";

export function GetAll(): Promise<{ [key: string]: files.Record }>;

export function GetItem(arg1: string): Promise<files.Record | null>;

export function RemoveItem(arg1: string): Promise<void>;

export function SetAll(arg1: { [key: string]: files.Record }): Promise<void>;

export function SetItem(arg1: string, arg2: files.Record): Promise<void>;