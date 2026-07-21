-- GC³ Portal Database Schema
-- Migration 027: Add 'operations' to user_role enum

ALTER TYPE user_role ADD VALUE 'operations_team' AFTER 'leadership';
