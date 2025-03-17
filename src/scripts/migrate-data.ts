import { DatabaseFactory, DatabaseType } from '../db/DatabaseFactory';
import { schema } from '../db/schema';
import 'dotenv/config';

/**
 * SQLite에서 PostgreSQL로 데이터 마이그레이션
 * 
 * 이 스크립트는 기존 SQLite 데이터베이스에서 PostgreSQL로 데이터를 마이그레이션합니다.
 * 다음과 같은 순서로 데이터를 이전합니다:
 * 1. 사용자 데이터
 * 2. 저장소 데이터
 * 3. 커밋 데이터
 * 4. PR 데이터
 * 5. 리뷰 데이터
 * 6. 팀 및 팀 멤버십 데이터
 */
async function migrateData() {
  // 소스 데이터베이스 (SQLite)
  const sqliteAdapter = DatabaseFactory.createAdapter(
    DatabaseType.SQLITE,
    process.env.SQLITE_DB_PATH || './data/github-metrics.db'
  );

  // 대상 데이터베이스 (PostgreSQL)
  const pgAdapter = DatabaseFactory.createAdapter(
    DatabaseType.POSTGRESQL,
    process.env.DATABASE_URL || 'postgresql://localhost:5432/github_metrics'
  );

  try {
    // 데이터베이스 연결 초기화
    await sqliteAdapter.initialize();
    await pgAdapter.initialize();

    console.log('데이터베이스 연결 성공. 마이그레이션을 시작합니다...');

    // 1. 사용자 데이터 마이그레이션
    console.log('사용자 데이터 마이그레이션 중...');
    const users = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.users)
    );
    
    for (const user of users) {
      try {
        await pgAdapter.insert(schema.users, {
          ...user,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt)
        });
      } catch (error) {
        console.error(`사용자 ID ${user.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`사용자 데이터 마이그레이션 완료: ${users.length}개`);

    // 2. 저장소 데이터 마이그레이션
    console.log('저장소 데이터 마이그레이션 중...');
    const repositories = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.repositories)
    );
    
    for (const repo of repositories) {
      try {
        await pgAdapter.insert(schema.repositories, {
          ...repo,
          lastSyncAt: new Date(repo.lastSyncAt),
          createdAt: new Date(repo.createdAt),
          updatedAt: new Date(repo.updatedAt)
        });
      } catch (error) {
        console.error(`저장소 ID ${repo.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`저장소 데이터 마이그레이션 완료: ${repositories.length}개`);

    // 3. 커밋 데이터 마이그레이션
    console.log('커밋 데이터 마이그레이션 중...');
    const commits = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.commits)
    );
    
    let commitSuccess = 0;
    for (const commit of commits) {
      try {
        await pgAdapter.insert(schema.commits, {
          ...commit,
          committedAt: new Date(commit.committedAt),
          createdAt: new Date(commit.createdAt),
          updatedAt: new Date(commit.updatedAt)
        });
        commitSuccess++;
        
        // 진행 상황 표시 (1000개 단위)
        if (commitSuccess % 1000 === 0) {
          console.log(`커밋 데이터 마이그레이션 진행 중: ${commitSuccess}/${commits.length}`);
        }
      } catch (error) {
        console.error(`커밋 ID ${commit.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`커밋 데이터 마이그레이션 완료: ${commitSuccess}/${commits.length}개`);

    // 4. PR 데이터 마이그레이션
    console.log('PR 데이터 마이그레이션 중...');
    const pullRequests = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.pullRequests)
    );
    
    for (const pr of pullRequests) {
      try {
        await pgAdapter.insert(schema.pullRequests, {
          ...pr,
          createdAt: new Date(pr.createdAt),
          updatedAt: new Date(pr.updatedAt),
          closedAt: pr.closedAt ? new Date(pr.closedAt) : null,
          mergedAt: pr.mergedAt ? new Date(pr.mergedAt) : null
        });
      } catch (error) {
        console.error(`PR ID ${pr.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`PR 데이터 마이그레이션 완료: ${pullRequests.length}개`);

    // 5. 리뷰 데이터 마이그레이션
    console.log('리뷰 데이터 마이그레이션 중...');
    const reviews = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.prReviews)
    );
    
    for (const review of reviews) {
      try {
        await pgAdapter.insert(schema.prReviews, {
          ...review,
          submittedAt: new Date(review.submittedAt),
          createdAt: new Date(review.createdAt),
          updatedAt: new Date(review.updatedAt)
        });
      } catch (error) {
        console.error(`리뷰 ID ${review.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`리뷰 데이터 마이그레이션 완료: ${reviews.length}개`);

    // 6. 팀 데이터 마이그레이션
    console.log('팀 데이터 마이그레이션 중...');
    const teams = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.teams)
    );
    
    for (const team of teams) {
      try {
        await pgAdapter.insert(schema.teams, {
          ...team,
          createdAt: new Date(team.createdAt),
          updatedAt: new Date(team.updatedAt)
        });
      } catch (error) {
        console.error(`팀 ID ${team.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`팀 데이터 마이그레이션 완료: ${teams.length}개`);

    // 7. 팀 멤버십 데이터 마이그레이션
    console.log('팀 멤버십 데이터 마이그레이션 중...');
    const teamMembers = await sqliteAdapter.select(
      sqliteAdapter.query.select().from(schema.teamMembers)
    );
    
    for (const member of teamMembers) {
      try {
        await pgAdapter.insert(schema.teamMembers, {
          ...member,
          createdAt: new Date(member.createdAt),
          updatedAt: new Date(member.updatedAt)
        });
      } catch (error) {
        console.error(`팀 멤버십 ID ${member.id} 마이그레이션 실패:`, error);
      }
    }
    console.log(`팀 멤버십 데이터 마이그레이션 완료: ${teamMembers.length}개`);

    console.log('모든 데이터 마이그레이션이 완료되었습니다.');
  } catch (error) {
    console.error('데이터 마이그레이션 중 오류 발생:', error);
  } finally {
    // 데이터베이스 연결 종료
    await sqliteAdapter.close();
    await pgAdapter.close();
  }
}

// 스크립트 실행
migrateData().catch(console.error); 