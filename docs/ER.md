# ER図

Supabase Auth の `auth.users` をユーザー本体とし、公開スキーマにはプロフィール、案件、監査ログを保持します。

```mermaid
erDiagram
    auth_users ||--|| profiles : "has"
    auth_users ||--o{ applications : "owns"
    auth_users ||--o{ audit_logs : "owns"
    auth_users ||--o{ audit_logs : "acts"

    auth_users {
        uuid id PK
    }

    profiles {
        uuid id PK,FK
        user_role role
        timestamptz created_at
    }

    applications {
        uuid id PK
        uuid owner_id FK
        application_platform platform
        text title
        text listing_url
        text genre_major
        text genre_minor
        numeric listed_amount_min
        numeric listed_amount_max
        numeric actual_amount
        integer applicant_count
        numeric client_rating
        numeric client_completion_rate
        date deadline
        application_status status
        text proposal_text
        text memo
        timestamptz created_at
        timestamptz updated_at
    }

    audit_logs {
        bigint id PK
        uuid owner_id FK
        uuid actor_id FK
        text action
        text target_table
        uuid target_id
        jsonb details
        timestamptz created_at
    }
```

`user_role` は `user | admin`、`application_platform` は `crowdworks | lancers | coconala | other`、`application_status` は `considering | applied | replied | contracted | rejected | passed` です（**保存は英字キー・画面表示は日本語ラベルに変換する**）。全公開テーブルで RLS を有効化し、通常ユーザーは本人の行だけ参照・操作できます。
