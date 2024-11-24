import Podcast from "@models/podcast";
import Playlist, { PlaylistDocument } from "@models/playlist";
import { Request, Response } from "express";
import to from "await-to-ts";
import handleError from "@utils/handleError";

type Params = {
  id: string;
};

const createPlaylist = async (
  req: Request<{}, {}, Partial<PlaylistDocument>>,
  res: Response
): Promise<any> => {
  const userId = req.user.userId;
  const title = req.body.title;
  const [error, playlist] = await to(
    Playlist.create({ user: userId, title: title })
  );
  if (error) return handleError(error, res);
  res.status(201).json({ message: "Playlist creation successful", playlist });
};

const getAllPlaylist = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user.userId;
  const [error, playlists] = await to(Playlist.find({ user: userId }).lean());
  if (error) return handleError(error, res);
  res.status(200).json({ playlists });
};

const getPlaylistById = async (
  req: Request<Params>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const userId = req.user.userId;
  const [error, playlist] = await to(
    Playlist.findOne({ user: userId, _id: id }).lean()
  );
  if (error) return handleError(error, res);
  res.status(200).json({ playlist });
};

const updatePlaylist = async (
  req: Request<Params, {}, Partial<PlaylistDocument>>,
  res: Response
): Promise<any> => {
  const id = req.params.id;
  const title = req.body.title;
  const [error, playlist] = await to(
    Playlist.findByIdAndUpdate(
      id,
      { $set: { title: title } },
      { new: true }
    ).lean()
  );
  if (error) return handleError(error, res);
  res.status(200).json({ message: "Successfully Playlist Updated", playlist });
};

const deletePlaylist = async (
  req: Request<Params>,
  res: Response
): Promise<any> => {
  const { id } = req.params;
  const [error] = await to(Playlist.findByIdAndDelete(id));
  if (error) return handleError(error, res);
  res.status(200).json({ message: "Playlist deleted" });
};

const addPodcast = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user.userId;
  const { playlistId, podcastId } = req.body;

  const [playlistError, playlist] = await to(
    Playlist.findOne({ _id: playlistId, user: userId })
  );
  if (playlistError) return handleError(playlistError, res);
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });

  const [podcastError, podcast] = await to(Podcast.findById(podcastId));
  if (podcastError) return handleError(podcastError, res);
  if (!podcast) return res.status(404).json({ error: "Podcast not found" });

  playlist.podcasts.push(podcastId);
  const [updateError, newPlaylist] = await to(playlist.save());
  if (updateError) return handleError(updateError, res);

  return res
    .status(200)
    .json({ message: "Podcast added to the playlist", newPlaylist });
};

const getAllPodcast = async (req: Request, res: Response): Promise<any> => {
  const id = req.params.id;
  const userId = req.user.userId;
  const [error, playlist] = await to(
    Playlist.findOne({ _id: id, user: userId })
  );
  if (error) return handleError(error, res);
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });

  return res.status(200).json({ message: "Success", data: playlist.podcasts });
};

const removePodcast = async (req: Request, res: Response): Promise<any> => {
  const userId = req.user.userId;
  const { playlistId, podcastId } = req.body;

  const [playlistError, playlist] = await to(
    Playlist.findOne({ _id: playlistId, user: userId })
  );
  if (playlistError) return handleError(playlistError, res);
  if (!playlist) return res.status(404).json({ error: "Playlist not found" });

  const [podcastError, podcast] = await to(Podcast.findById(podcastId));
  if (podcastError) return handleError(podcastError, res);
  if (!podcast) return res.status(404).json({ error: "Podcast not found" });

  const [updateError, newPlaylist] = await to(
    Playlist.findByIdAndUpdate(
      playlistId,
      { $pull: { podcasts: podcastId } },
      { new: true }
    )
  );
  if (updateError) return handleError(updateError, res);

  return res
    .status(200)
    .json({ message: "Podcast removed from Playlist", newPlaylist });
};

const PlaylistController = {
  createPlaylist,
  getAllPlaylist,
  getPlaylistById,
  updatePlaylist,
  deletePlaylist,
  addPodcast,
  getAllPodcast,
  removePodcast,
};

export default PlaylistController;
