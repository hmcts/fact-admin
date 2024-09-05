Feature: Local authorities List

  Scenario Outline: As a user when I try to edit and update local authority with valid data it should allow me to update and acknowledge me with proper success message
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on local authorities list
    When I select local authority "<local authority id>"
    When I edit the local authority "<local authority>"
    When I click on save local authority list
    Then Success message is displayed for local authorities list with summary "Local authority updated"

    Examples:
      | local authority id     | local authority        |
      | Barnet_Borough_Council | Barnet Borough Council |

  Scenario Outline: As a user when I try to enter duplicate local authority it should not allow me to update and acknowledge me with proper error message
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on local authorities list
    When I select local authority "<local authority id>"
    When I edit the local authority "<duplicate local authority>"
    When I click on save local authority list
    Then An error is displayed for edit local authorities with title "There is a problem" and summary "Local Authority already exists."

    Examples:
      | local authority id     | duplicate local authority |
      | Barnet_Borough_Council | Luton Borough Council     |

  Scenario Outline: As a user when I try to enter invalid local authority it should not allow me to update and acknowledge me with proper error message
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on local authorities list
    When I select local authority "<local authority id>"
    When I edit the local authority "<invalid local authority>"
    When I click on save local authority list
    Then An error is displayed for edit local authorities with title "There is a problem" and summary "Invalid Local Authority entered."

    Examples:
      | local authority id     | invalid local authority  |
      | Barnet_Borough_Council | Lutonnnc Borough Council |

  Scenario Outline: As a user when I try to enter blanc local authority field it should not allow me to update and acknowledge me with proper error message
    When I log in as a super-admin
    When I click on lists link
    Then I am redirected to the "Edit A List" page
    When I hover over the tab title
    And I click on local authorities list
    When I select local authority "<local authority id>"
    When I edit the local authority ""
    When I click on save local authority list
    Then An error is displayed for edit local authorities with title "There is a problem" and summary "The local authority name is required."

    Examples:
      | local authority id     |
      | Barnet_Borough_Council |
