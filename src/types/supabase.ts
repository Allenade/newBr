export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          full_name: string | null;
          username: string | null;
          plan: string;
          balance: number;
          bonus: number;
          avatar_url: string | null;
          updated_at: string;
          created_at: string;
        };
      };
      plans: {
        Row: {
          id: string;
          name: string;
          price: number;
          created_at: string;
          updated_at: string;
        };
      };
    };
    Functions: {
      get_all_users_with_details: {
        Args: Record<string, never>;
        Returns: {
          user_id: string;
          email: string;
          plan_id: string | null;
          plan_name: string;
          balance: number;
          bonus: number;
          updated_at: string;
        }[];
      };
      update_user_plan: {
        Args: {
          user_id_param: string;
          plan_id_param: string;
        };
        Returns: undefined;
      };
      add_to_balance: {
        Args: {
          user_id: string;
          amount: number;
        };
        Returns: undefined;
      };
      add_to_bonus: {
        Args: {
          user_id: string;
          amount: number;
        };
        Returns: undefined;
      };
    };
  };
};
