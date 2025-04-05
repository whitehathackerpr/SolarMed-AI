import os
import sqlite3
import shutil
import datetime
import json
from typing import Optional
import logging
from pathlib import Path

logger = logging.getLogger(__name__)

class BackupManager:
    def __init__(self, db_path: str, backup_dir: str = "backups"):
        self.db_path = db_path
        self.backup_dir = backup_dir
        self._ensure_backup_dir()

    def _ensure_backup_dir(self):
        """Ensure backup directory exists"""
        os.makedirs(self.backup_dir, exist_ok=True)

    def create_backup(self) -> str:
        """Create a backup of the database"""
        try:
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            backup_path = os.path.join(self.backup_dir, f"solarmed_{timestamp}.db")
            
            # Copy database file
            shutil.copy2(self.db_path, backup_path)
            
            # Create metadata
            metadata = {
                "timestamp": timestamp,
                "size": os.path.getsize(backup_path),
                "original_path": self.db_path
            }
            
            # Save metadata
            with open(f"{backup_path}.meta", "w") as f:
                json.dump(metadata, f)
            
            logger.info(f"Created backup: {backup_path}")
            return backup_path
        except Exception as e:
            logger.error(f"Backup creation failed: {str(e)}")
            raise

    def restore_backup(self, backup_path: str) -> bool:
        """Restore database from backup"""
        try:
            if not os.path.exists(backup_path):
                raise FileNotFoundError(f"Backup file not found: {backup_path}")
            
            # Verify backup integrity
            self._verify_backup(backup_path)
            
            # Create backup of current database
            current_backup = self.create_backup()
            logger.info(f"Created backup of current database: {current_backup}")
            
            # Restore from backup
            shutil.copy2(backup_path, self.db_path)
            
            logger.info(f"Restored database from backup: {backup_path}")
            return True
        except Exception as e:
            logger.error(f"Restore failed: {str(e)}")
            raise

    def _verify_backup(self, backup_path: str) -> bool:
        """Verify backup integrity"""
        try:
            # Check if backup file exists
            if not os.path.exists(backup_path):
                return False
            
            # Check if metadata file exists
            meta_path = f"{backup_path}.meta"
            if not os.path.exists(meta_path):
                return False
            
            # Verify database integrity
            conn = sqlite3.connect(backup_path)
            cursor = conn.cursor()
            
            # Check if database is valid
            cursor.execute("PRAGMA integrity_check")
            result = cursor.fetchone()
            
            conn.close()
            
            if result[0] != "ok":
                return False
            
            return True
        except Exception as e:
            logger.error(f"Backup verification failed: {str(e)}")
            return False

    def list_backups(self) -> list:
        """List all available backups"""
        try:
            backups = []
            for file in os.listdir(self.backup_dir):
                if file.endswith(".db"):
                    backup_path = os.path.join(self.backup_dir, file)
                    meta_path = f"{backup_path}.meta"
                    
                    if os.path.exists(meta_path):
                        with open(meta_path, "r") as f:
                            metadata = json.load(f)
                            backups.append({
                                "path": backup_path,
                                "timestamp": metadata["timestamp"],
                                "size": metadata["size"]
                            })
            
            return sorted(backups, key=lambda x: x["timestamp"], reverse=True)
        except Exception as e:
            logger.error(f"Failed to list backups: {str(e)}")
            return []

    def cleanup_old_backups(self, max_backups: int = 10) -> None:
        """Clean up old backups, keeping only the specified number"""
        try:
            backups = self.list_backups()
            if len(backups) <= max_backups:
                return
            
            # Remove oldest backups
            for backup in backups[max_backups:]:
                os.remove(backup["path"])
                meta_path = f"{backup['path']}.meta"
                if os.path.exists(meta_path):
                    os.remove(meta_path)
                
                logger.info(f"Removed old backup: {backup['path']}")
        except Exception as e:
            logger.error(f"Backup cleanup failed: {str(e)}")
            raise

    def get_backup_info(self, backup_path: str) -> Optional[dict]:
        """Get information about a specific backup"""
        try:
            if not os.path.exists(backup_path):
                return None
            
            meta_path = f"{backup_path}.meta"
            if not os.path.exists(meta_path):
                return None
            
            with open(meta_path, "r") as f:
                metadata = json.load(f)
            
            return {
                "path": backup_path,
                "timestamp": metadata["timestamp"],
                "size": metadata["size"],
                "original_path": metadata["original_path"]
            }
        except Exception as e:
            logger.error(f"Failed to get backup info: {str(e)}")
            return None 