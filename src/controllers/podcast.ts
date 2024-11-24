import to from "await-to-ts";
import { Request, Response } from "express";
import { getAudioMetadata, getImageMetadata } from "@utils/extractMetadata";
import path from "path";
import fs from "fs";

import Podcast, { PodcastDocument } from "@models/podcast";
import Category from "@models/category";
import SubCategory from "@models/subCategory";
import Creator from "@models/creator";

import handleError from "@utils/handleError";

type PodcastFileFields = {
  audio: Express.Multer.File[];
  cover: Express.Multer.File[];
};
type PodcastPayload = {
  categoryId: string;
  subCategoryId: string;
  title: string;
  description: string;
  location: string;
};
type PodcastRequest = Request<{}, {}, PodcastPayload> & {
  files: PodcastFileFields;
};

type Params = {
  id: string;
};

const create = async (req: Request, res: Response): Promise<any> => {
  const podcastReq = req as PodcastRequest;
  const creatorId = req.user.creatorId;
  const { audio, cover } = podcastReq.files;
  const { categoryId, subCategoryId, title, description, location } =
    podcastReq.body;

  const audio_path = audio[0].path;
  const cover_path = cover[0].path;
  const audioMetadata = await getAudioMetadata(audio_path);
  const imageMetadata = await getImageMetadata(cover_path);

  const [error, podcast] = await to(
    Podcast.create({
      creator: creatorId,
      category: categoryId,
      subCategory: subCategoryId,
      title: title,
      description: description,
      location: location,
      cover: cover_path,
      coverFormat: imageMetadata.format,
      coverSize: imageMetadata.size,
      audio: audio_path,
      audioFormat: audioMetadata.format,
      audioSize: audioMetadata.size,
      audioDuration: audioMetadata.duration,
    })
  );
  if (error) return handleError(error, res);

  let updateError;
  [updateError] = await to(
    Creator.findByIdAndUpdate(creatorId, { $push: { podcasts: podcast._id } })
  );
  if (updateError) {
    await Podcast.findByIdAndDelete(podcast._id);
    return handleError(updateError, res);
  }
  [updateError] = await to(
    Category.findByIdAndUpdate(categoryId, { $push: { podcasts: podcast._id } })
  );
  if (updateError) {
    await Podcast.findByIdAndDelete(podcast._id);
    return handleError(updateError, res);
  }
  [updateError] = await to(
    SubCategory.findByIdAndUpdate(subCategoryId, {
      $push: { podcasts: podcast._id },
    })
  );
  if (updateError) {
    await Podcast.findByIdAndDelete(podcast._id);
    return handleError(updateError, res);
  }

  return res.status(201).json({
    message: "Podcast created.",
    data: podcast,
  });
};

const getAll = async (req: Request, res: Response): Promise<any> => {
  const [error, podcasts] = await to(Podcast.find().populate("creator"));
  if (error) return handleError(error, res);
  return res.status(200).json({
    message: "Successfully fetched all podcasts",
    data: podcasts,
  });
};

const getById = async (req: Request<Params>, res: Response): Promise<any> => {
  const { id } = req.params;
  const [error, podcast] = await to(Podcast.findById(id));
  if (error) return handleError(error, res);
  return res.status(200).json({
    message: "Successfully fetched the podcast",
    data: podcast,
  });
};

const update = async (req: Request, res: Response): Promise<any> => {
  const podcastReq = req as PodcastRequest;
  let error;
  const { id } = req.params;
  const { cover } = podcastReq.files;
  const { categoryId, subCategoryId, title, description, location } =
    podcastReq.body;

  const updateFields: {
    category?: string;
    subCategory?: string;
    title?: string;
    description?: string;
    location?: string;
    cover?: string;
  } = {};

  if (categoryId) {
    let category;
    [error, category] = await to(Category.findById(categoryId));
    if (error) handleError(error, res);
    if (!category)
      return res.status(404).json({ error: "Category not found!" });
    updateFields.category = categoryId;
  }
  if (subCategoryId) {
    let subCategory;
    [error, subCategory] = await to(SubCategory.findById(subCategoryId));
    if (error) handleError(error, res);
    if (!subCategory) {
      return res.status(404).json({ error: "SubCategory not found!" });
    }
    updateFields.subCategory = subCategoryId;
  }
  if (title) updateFields.title = title;
  if (description) updateFields.description = description;
  if (location) updateFields.location = location;
  if (cover) updateFields.cover = cover[0].path;

  let podcast;
  [error, podcast] = await to(
    Podcast.findByIdAndUpdate(id, { $set: updateFields }, { new: true })
  );
  if (error) return res.status(500).json({ error: error.message });
  res.status(200).json({ message: "Podcast updated successfully", podcast });
};

const remove = async (req: Request<Params>, res: Response): Promise<any> => {
  let error, podcast;
  const { id } = req.params;
  [error, podcast] = await to(Podcast.findById(id));
  if (error) return handleError(error, res);
  if (!podcast) return res.status(400).json({ error: "Podcast Not Found" });
  const coverPath = path.resolve(podcast.cover!);
  const audioPath = path.resolve(podcast.audio);

  fs.unlink(coverPath, (err) => {
    if (err) {
      console.error("Failed to delete file:", err);
      return res
        .status(500)
        .json({ error: "Failed to delete file from storage" });
    }
  });
  fs.unlink(audioPath, (err) => {
    if (err) {
      console.error("Failed to delete file:", err);
      return res
        .status(500)
        .json({ error: "Failed to delete file from storage" });
    }
  });

  [error] = await to(
    Creator.findByIdAndUpdate(podcast.creator, { $pull: { podcasts: id } })
  );
  if (error) return handleError(error, res);

  [error] = await to(
    Category.findByIdAndUpdate(podcast.category, { $pull: { podcasts: id } })
  );
  if (error) return handleError(error, res);

  [error] = await to(
    SubCategory.findByIdAndUpdate(podcast.subCategory, {
      $pull: { podcasts: id },
    })
  );
  if (error) return handleError(error, res);

  [error] = await to(Podcast.findByIdAndDelete(id));
  if (error) return handleError(error, res);

  res.status(200).json({ message: "Podcast deleted successfully" });
};

export const updateLikeCount = async (
  podcastId: string,
  value: number
): Promise<number> => {
  const podcast = await Podcast.findByIdAndUpdate(
    podcastId,
    { $inc: { totalLikes: value } },
    { new: true }
  );
  return podcast!.totalLikes;
};

export const updateCommentCount = async (podcastId: string): Promise<void> => {
  const [error, podcast] = await to(
    Podcast.findByIdAndUpdate(
      podcastId,
      { $inc: { totalComments: 1 } },
      { new: true }
    )
  );
  if (error) console.error(error);
  if (!podcast) console.error("Failed to update podcast comment count");
};

const PodcastController = {
  create,
  getAll,
  getById,
  update,
  remove,
};

export default PodcastController;
