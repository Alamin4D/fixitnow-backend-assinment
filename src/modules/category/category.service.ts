import { prisma } from "../../lib/prisma";

const getAll = async () => {
  const categories = await prisma.category.findMany({
    where: { isActive: true },
    include: {
      _count: { select: { services: true } },
    },
    orderBy: { name: "asc" },
  });
  return categories;
};

const getById = async (id: string) => {
  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      services: {
        where: { isActive: true },
        include: {
          technician: {
            include: {
              user: { select: { name: true, email: true } },
            },
          },
        },
      },
    },
  });
  if (!category) throw new Error("Category not found.");
  return category;
};

const create = async (payload: { name: string; description?: string; icon?: string }) => {
  const existing = await prisma.category.findUnique({ where: { name: payload.name } });
  if (existing) 
    throw new Error("Category with this name already exists.");

  const category = await prisma.category.create({ data: payload });
  return category;
};

const update = async (id: string, payload: { name?: string; description?: string; icon?: string; isActive?: boolean }) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) 
    throw new Error("Category not found.");

  if (payload.name) {
    const existing = await prisma.category.findFirst({
      where: { name: payload.name, id: { not: id } },
    });
    if (existing) 
        throw new Error("Category with this name already exists.");
  }

  const updated = await prisma.category.update({ where: { id }, data: payload });
  return updated;
};

const remove = async (id: string) => {
  const category = await prisma.category.findUnique({ where: { id } });
  if (!category) 
    throw new Error("Category not found.");

  await prisma.category.update({ where: { id }, data: { isActive: false } });
  return null;
};

export const CategoryService = { 
    getAll, 
    getById, 
    create, 
    update, 
    remove 
};