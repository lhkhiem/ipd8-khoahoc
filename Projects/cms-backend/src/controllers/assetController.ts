import { Request, Response } from 'express';
import path from 'path';
import fs from 'fs';
import { v4 as uuidv4 } from 'uuid';
import Asset from '../models/Asset';
import MediaFolder from '../models/MediaFolder';
import { pipeline } from 'stream';
import { promisify } from 'util';
import https from 'https';
import { toWebpUnder100KB } from '../utils/media';

const pump = promisify(pipeline);

// Store under storage/uploads (publicly served at /uploads)
const UPLOAD_ROOT = path.resolve(__dirname, '../../storage/uploads');

function ensureDir(p: string) {
  if (!fs.existsSync(p)) fs.mkdirSync(p, { recursive: true });
}

// moved to utils/media

export const uploadFile = async (req: Request, res: Response) => {
  try {
    const file = (req as any).file as Express.Multer.File;
    const { folder_id } = req.body;
    if (!file) return res.status(400).json({ error: 'No file uploaded' });

    ensureDir(UPLOAD_ROOT);
    const id = uuidv4();
    const dateDir = new Date().toISOString().slice(0, 10);
    const dir = path.join(UPLOAD_ROOT, dateDir, id);
    ensureDir(dir);

    const originalPath = path.join(dir, `original_${file.originalname}`);
    fs.writeFileSync(originalPath, file.buffer);

    // Create variants
    const input = file.buffer;
    const variants = [
      { key: 'thumb', width: 320 },
      { key: 'medium', width: 800 },
      { key: 'large', width: 1200 },
    ];

    const sizes: any = {};
    for (const v of variants) {
      const out = await toWebpUnder100KB(input, v.width);
      const outPath = path.join(dir, `${v.key}.webp`);
      fs.writeFileSync(outPath, out.buffer);
      sizes[v.key] = {
        url: `/uploads/${dateDir}/${id}/${v.key}.webp`,
        width: out.info.width,
        height: out.info.height,
        size: out.buffer.byteLength,
        format: 'webp',
      };
    }

    const saved = await Asset.create({
      type: 'image',
      provider: 'local',
      url: `/uploads/${dateDir}/${id}/original_${file.originalname}`,
      width: sizes.large?.width || sizes.medium?.width,
      height: sizes.large?.height || sizes.medium?.height,
      format: path.extname(file.originalname).replace('.', ''),
      sizes,
      folder_id: folder_id || null,
    } as any);

    return res.status(201).json({ data: saved });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Upload failed' });
  }
};

export const fetchRemote = async (req: Request, res: Response) => {
  try {
    const { url, folder_id } = req.body as { url: string; folder_id?: string };
    if (!url) return res.status(400).json({ error: 'url is required' });

    const id = uuidv4();
    const dateDir = new Date().toISOString().slice(0, 10);
    const dir = path.join(UPLOAD_ROOT, dateDir, id);
    ensureDir(dir);

    // download
    const originalPath = path.join(dir, `original`);
    await new Promise<void>((resolve, reject) => {
      const file = fs.createWriteStream(originalPath);
      https.get(url, (response) => {
        response.pipe(file);
        file.on('finish', () => file.close(() => resolve()));
      }).on('error', (err) => reject(err));
    });
    const input = fs.readFileSync(originalPath);

    const variants = [
      { key: 'thumb', width: 320 },
      { key: 'medium', width: 800 },
      { key: 'large', width: 1200 },
    ];
    const sizes: any = {};
    for (const v of variants) {
      const out = await toWebpUnder100KB(input, v.width);
      const outPath = path.join(dir, `${v.key}.webp`);
      fs.writeFileSync(outPath, out.buffer);
      sizes[v.key] = {
        url: `/uploads/${dateDir}/${id}/${v.key}.webp`,
        width: out.info.width,
        height: out.info.height,
        size: out.buffer.byteLength,
        format: 'webp',
      };
    }

    const saved = await Asset.create({
      type: 'image',
      provider: 'local',
      url: `/uploads/${dateDir}/${id}/original`,
      width: sizes.large?.width || sizes.medium?.width,
      height: sizes.large?.height || sizes.medium?.height,
      format: 'unknown',
      sizes,
      folder_id: folder_id || null,
    } as any);

    return res.status(201).json({ data: saved });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ error: 'Fetch failed' });
  }
};

export const createFolder = async (req: Request, res: Response) => {
  const { name, parent_id } = req.body;
  if (!name) return res.status(400).json({ error: 'name is required' });
  const folder = await MediaFolder.create({ name, parent_id: parent_id || null } as any);
  res.status(201).json({ data: folder });
};

export const listFolders = async (_req: Request, res: Response) => {
  const folders = await MediaFolder.findAll({ order: [['name', 'ASC']] });
  res.json({ data: folders });
};

export const listAssets = async (req: Request, res: Response) => {
  const { folder_id } = req.query as any;
  const where: any = {};
  if (folder_id) where.folder_id = folder_id;
  const assets = await Asset.findAll({ where, order: [['created_at', 'DESC']] });
  res.json({ data: assets });
};

export const getAssetById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const asset = await Asset.findByPk(id);
    if (!asset) {
      return res.status(404).json({ error: 'Asset not found' });
    }
    res.json(asset);
  } catch (error) {
    console.error('Failed to fetch asset:', error);
    res.status(500).json({ error: 'Failed to fetch asset' });
  }
};

export const deleteAsset = async (req: Request, res: Response) => {
  const { id} = req.params;
  const asset = await Asset.findByPk(id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  // best-effort delete files
  try {
    const url = (asset as any).url as string;
    if (url?.startsWith('/uploads/')) {
      const rel = url.replace('/uploads/', '');
      const dir = path.join(UPLOAD_ROOT, rel.split('/')[0], rel.split('/')[1]);
      if (fs.existsSync(path.join(UPLOAD_ROOT, dir))) {
        fs.rmSync(dir, { recursive: true, force: true });
      }
    }
  } catch {}
  await asset.destroy();
  res.json({ message: 'deleted' });
};
