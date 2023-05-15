Feature: Login/Logout

  Background:
    Given I am on new browser
    And I am on FACT homepage
    Then I am logged out if I am a super admin
    And I am on the admin portal sign in page
    When I fill in the Username and Password fields with my viewer authenticated credentials
    And click the Sign In button
    Then the system will sign me in
    And I cannot view super admin content
    When I click edit next to court with "amersham-law-courts"
    Then I am redirected to the Edit Court page for the chosen court

  Scenario Outline: viewer can log in and only see specific tabs for a selected court
    And It is "<shouldBeVisible>" that the "<tab>" tab is visible

    Examples:
      | tab                          | shouldBeVisible |
      | #tab_opening-hours           | false           |
      | #tab_phone-numbers           | false           |
      | #tab_emails                  | false           |
      | #tab_court-types             | false           |
      | #tab_court-facilities        | false           |
      | #tab_cases-heard             | false           |
      | #tab_addresses               | false           |
      | #tab_photo                   | false           |
      | #tab_application-progression | false           |
      | #tab_additional-links        | false           |
      | #tab_spoe                    | false           |
      | #tab_postcodes               | true            |
      | #tab_local-authorities       | true            |

